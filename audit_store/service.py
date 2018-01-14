from datetime import timedelta

from django.db import connection
from django.db.transaction import atomic
from django.db.models import Count
from django.contrib.auth.models import Group

from guardian.shortcuts import assign_perm, remove_perm

from notifications.signals import notify
from notifications.models import Notification

from notify.service import mail_notify

from kronos.utils import today_ist

from .models import AuditStore
from auditor.models import ProfileInfo
from audit.models import AuditCycle
from kronos.exceptions import ObjectNotFound, AppLogicError
import answer.service.report_section as report_section_service
import answer.service.answer as answer_service
import questionnaire.service.question as question_service
import questionnaire.service.section as section_service
import payment.service.payment_manager as payment_manager_service
import client.service.client_user as client_user_service
from notify import verbs

from registration.models import GROUP_NAME_MANAGER

def find_by_id(audit_store_id):
    try:
        return AuditStore.objects.get(pk=audit_store_id)
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def find_audit_stores_for_auditor(profileinfo_id):
    try:
        profile_info = ProfileInfo.objects.get(pk=profileinfo_id)
        return AuditStore.objects.filter(
            user_id=profile_info.user_id,
            status__in=(AuditStore.ASSIGNED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED),
            audit__audit_cycle__status__in=(AuditCycle.UPCOMING, AuditCycle.ACTIVE, AuditCycle.REPORT)
        ).order_by('-audit_date')
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e

def find_by_audit(audit_id):
    return AuditStore.objects.filter(audit_id=audit_id).prefetch_related(
        'user',
        'user__profileinfo',
    )

def find_by_audit_cycle(audit_cycle_id):
    return AuditStore.objects.filter(audit__audit_cycle_id=audit_cycle_id).prefetch_related(
        'user',
        'user__profileinfo',
        'audit',
        'audit__audit_cycle',
        'audit__audit_cycle__client',
        'audit__store',
        'audit__store__city',
        'audit__store__client',
    )

def find_by_id_for_auditor(audit_store_id, user_id):
    try:
        return AuditStore.objects.get(
            pk=audit_store_id,
            user_id=user_id,
            status__in=(AuditStore.ASSIGNED, AuditStore.SUBMITTED, AuditStore.FAILED, AuditStore.COMPLETED, AuditStore.ACCEPTED, AuditStore.REJECTED),
            audit__audit_cycle__status__in=(AuditCycle.UPCOMING, AuditCycle.ACTIVE, AuditCycle.REPORT)
        )
    except (AuditStore.DoesNotExist) as e:
        raise ObjectNotFound from e


def find_latest_for_client(client_id):
    return AuditStore.objects.presentable().filter(audit__audit_cycle__client_id=client_id)[:5]


def find_by_store_for_client(store_id, client_id):
    return AuditStore.objects.presentable().filter(
        audit__audit_cycle__client_id=client_id,
        audit__store_id=store_id,
    ).prefetch_related(
        'report_sections',
        'report_sections__section',
        'report_sections__section__questions',
        'report_sections__section__questions__answers',
        'audit',
        'audit__store',
        'audit__store__city',
        'audit__audit_cycle',
        'audit__audit_cycle__client',
        'audit__audit_cycle__sections',
    )


def find_for_pre_reminder():
    return AuditStore.objects.filter(
        audit_date=today_ist() + timedelta(days=1),
        status=AuditStore.ASSIGNED,
    )

def find_for_on_reminder():
    return AuditStore.objects.filter(
        audit_date=today_ist(),
        status=AuditStore.ASSIGNED,
    )

def find_for_post_reminder():
    return AuditStore.objects.filter(
        audit_date=today_ist() - timedelta(days=1),
        status=AuditStore.ASSIGNED,
    )

def save(audit_store):
    AuditStore.save(audit_store)
    return audit_store

@atomic
def withdraw(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        if audit_store.status not in (AuditStore.COMPLETED, AuditStore.FAILED):
            audit_store.status = AuditStore.WITHDRAWN
            audit_store.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_WITHDRAWN,
                action_object=audit_store,
                target=audit_store.audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_WITHDRAWN).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=audit_store.user,
                verb=verbs.AUDIT_STORE_WITHDRAWN,
                action_object=audit_store,
                target=audit_store.audit
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_WITHDRAWN).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
            return audit_store
        else:
            raise AppLogicError("audit store cannot be withdrawn now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def submit(audit_store_id, user_id):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id, user_id=user_id)
        report_sections = report_section_service.find_by_audit_store_for_user(audit_store_id, user_id)
        answers = answer_service.find_by_audit_store_for_auditor(audit_store_id, user_id)
        questions = question_service.find_by_audit_cycle(audit_store.audit.audit_cycle.id)
        sections = section_service.find_by_audit_cycle(audit_store.audit.audit_cycle.id)

        if len(sections) != len(report_sections):
            raise AppLogicError("Please answer all the section summaries")
        if len(questions) != len(answers):
            raise AppLogicError("Please answer all the questions")

        for report_section in report_sections:
            if report_section.auditor_comment in (None, ''):
                raise AppLogicError("Please fill all the section summaries")

        for answer in answers:
            if answer.answer_text in (None, ''):
                raise AppLogicError("Please fill all the answers")

        if audit_store.status == AuditStore.ASSIGNED:
            audit_store.status = AuditStore.SUBMITTED
            audit_store.save()
            notify.send(
                audit_store.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_SUBMITTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_SUBMITTED).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                audit_store.user,
                recipient=audit_store.user,
                verb=verbs.AUDIT_STORE_SUBMITTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_SUBMITTED).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
            return audit_store
        else:
            raise AppLogicError("audit store cannot be submitted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def complete(audit_store_id, qa_rating, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if not audit_store.is_completable():
            raise AppLogicError("Report is not complete.")

        if audit_store.status == AuditStore.SUBMITTED:
            audit_store.status = AuditStore.COMPLETED
            audit_store.qa_rating = qa_rating
            audit_store.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_COMPLETED,
                action_object=audit_store,
                target=audit_store.audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_COMPLETED).order_by('-id')[0].id
            #connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=audit_store.user,
                verb=verbs.AUDIT_STORE_COMPLETED,
                action_object=audit_store,
                target=audit_store.audit
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_COMPLETED).order_by('-id')[0].id
            #connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
            return audit_store
        else:
            raise AppLogicError("audit store cannot be completed now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def fail(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status in (AuditStore.SUBMITTED, AuditStore.ASSIGNED):
            audit_store.status = AuditStore.FAILED
            audit_store.qa_rating = AuditStore.BAD
            audit_store.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_FAILED,
                action_object=audit_store,
                target=audit_store.audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_FAILED).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=audit_store.user,
                verb=verbs.AUDIT_STORE_FAILED,
                action_object=audit_store,
                target=audit_store.audit
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_FAILED).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
            return audit_store
        else:
            raise AppLogicError("audit store cannot be failed now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def submit_by_manager(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.ASSIGNED:
            audit_store.status = AuditStore.SUBMITTED
            audit_store.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_SUBMITTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                user_actor,
                recipient=audit_store.user,
                verb=verbs.AUDIT_STORE_SUBMITTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be unsubmitted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def set_audit_date(audit_store_id, audit_date):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        audit = audit_store.audit

        if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
            raise AppLogicError("audit date is out of range")
        if audit_store.status != AuditStore.SUBMITTED:
            raise AppLogicError("application cannot be approved right now")

        audit_store.audit_date = audit_date
        audit_store.save()
        return audit_store
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def unsubmit(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.SUBMITTED:
            audit_store.status = AuditStore.ASSIGNED
            audit_store.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_UNSUBMITTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_UNSUBMITTED).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=audit_store.user,
                verb=verbs.AUDIT_STORE_UNSUBMITTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_UNSUBMITTED).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
            return audit_store
        else:
            raise AppLogicError("audit store cannot be unsubmitted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def uncomplete(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.COMPLETED:
            audit_store.status = AuditStore.SUBMITTED
            audit_store.save()
            return audit_store
        else:
            raise AppLogicError("audit store cannot be uncompleted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def accept(audit_store_id, payment_amount, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.COMPLETED:
            audit_store.status = AuditStore.ACCEPTED
            audit_store.save()

            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_ACCEPTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_ACCEPTED).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=audit_store.user,
                verb=verbs.AUDIT_STORE_ACCEPTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_ACCEPTED).order_by('-id')[0].id
            connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))

            ## add the entry to the payment row
            payment_manager_service.add_payment_on_audit_store_accepted(audit_store.id, payment_amount, user_actor)

            return audit_store
        else:
            raise AppLogicError("audit store cannot be accepted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def reject(audit_store_id, user_actor):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.COMPLETED:
            audit_store.status = AuditStore.REJECTED
            audit_store.qa_rating = AuditStore.BAD
            audit_store.save()
            notify.send(
                user_actor,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_STORE_REJECTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_REJECTED).order_by('-id')[0].id
            #connection.on_commit(lambda: mail_notify.send_notification_mail(manager_notif_id))
            notify.send(
                user_actor,
                recipient=audit_store.user,
                verb=verbs.AUDIT_STORE_REJECTED,
                action_object=audit_store,
                target=audit_store.audit
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_STORE_REJECTED).order_by('-id')[0].id
            #connection.on_commit(lambda: mail_notify.send_notification_mail(auditor_notif_id))
            return audit_store
        else:
            raise AppLogicError("audit store cannot be rejected now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def assign_audit_store_to_client_user(audit_store_id, user_id):
    audit_store = find_by_id(audit_store_id)
    user = client_user_service.find_clientuser_by_user_id(user_id)

    if not user.clientuser.client.id == audit_store.audit.audit_cycle.client.id:
        raise AppLogicError("cannot assign AuditStore across client boundries")

    assign_perm('clientuser_visible', user, audit_store)
    return audit_store

@atomic
def revoke_audit_store_from_client_user(audit_store_id, user_id):
    audit_store = find_by_id(audit_store_id)
    user = client_user_service.find_clientuser_by_user_id(user_id)

    if not user.clientuser.client.id == audit_store.audit.audit_cycle.client.id:
        raise AppLogicError("cannot revoke AuditStore across client boundries")

    remove_perm('clientuser_visible', user, audit_store)
    return audit_store


def get_audit_store_stats(audit_cycle_id):
    return AuditStore.objects.filter(audit__audit_cycle__id=audit_cycle_id).values('status').annotate(count=Count('status'))
