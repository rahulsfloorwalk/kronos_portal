from django.db.transaction import atomic
from django.db import IntegrityError
from django.contrib.auth.models import Group
from notifications.signals import notify

from client.models import Client
from .models import AuditStore
from auditor.models import ProfileInfo
from audit.models import AuditCycle
from kronos.exceptions import ObjectNotFound, AppLogicError
import answer.service.report_section as report_section_service
import answer.service.answer as answer_service
import questionnaire.service.question as question_service
import questionnaire.service.section as section_service

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR

def get_audit_stores(profileinfo_id):
    try:
        profile_info = ProfileInfo.objects.get(pk=profileinfo_id)
        return AuditStore.objects.filter(user_id=profile_info.user_id)
    except ProfileInfo.DoesNotExist as e:
        raise ObjectNotFound from e

def find_by_audit_cycle(audit_cycle_id):
    try:
        audit_stores = []
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
        for audit in audit_cycle.audits.all():
            audit_stores.extend(audit.audit_stores.all())
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e
    return audit_stores

def get_audit_store(audit_store_id, profileinfo_id):
    try:
        profile_info = ProfileInfo.objects.get(pk=profileinfo_id)
        return AuditStore.objects.get(id=audit_store_id, user_id=profile_info.user_id)
    except (ProfileInfo.DoesNotExist, AuditStore.DoesNotExist) as e:
        raise ObjectNotFound from e


def find_latest_for_client(client_id):
    return AuditStore.objects.filter(audit__audit_cycle__client_id=client_id, status=AuditStore.COMPLETED)[:5]


def find_by_store_for_client(store_id, client_id):
    return AuditStore.objects.filter(
            audit__audit_cycle__client_id=client_id,
            audit__store_id=store_id,
            status=AuditStore.COMPLETED,
        )

def find_by_id_for_client(audit_store_id, client_id):
    try:
        return AuditStore.objects.get(
                audit__audit_cycle__client_id=client_id,
                id=audit_store_id,
                status=AuditStore.COMPLETED,
            )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def save(audit_store):
    AuditStore.save(audit_store)
    return audit_store

@atomic
def withdraw(audit_store_id):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
        if audit_store.status not in (AuditStore.COMPLETED, AuditStore.FAILED):
            audit_store.status = AuditStore.WITHDRAWN
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                audit_store.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_WITHDRAWN',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                    audit_store.user,
                    recipient=audit_store.user,
                    verb='AUDIT_STORE_WITHDRAWN',
                    action_object=audit_store,
                    target=audit_store.audit
            )
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
        answers = answer_service.get_answers(audit_store_id, user_id)
        questions = question_service.find_by_audit_cycle(audit_store.audit.audit_cycle.id)
        sections = section_service.find_by_audit_cycle(audit_store.audit.audit_cycle.id)

        if len(sections) != len(report_sections):
            raise AppLogicError("Please answer all the section summaries")
        if len(questions) != len(answers):
            raise AppLogicError("Please answer all the questions")

        for report_section in report_sections:
            if report_section.auditor_comment in ( None ,''):
                raise AppLogicError("Please fill all the section summaries")

        for answer in answers:
            if answer.answer_text in ( None ,''):
                raise AppLogicError("Please fill all the answers")

        if audit_store.status == AuditStore.ASSIGNED:
            audit_store.status = AuditStore.SUBMITTED
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                    audit_store.user,
                    recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                    verb='AUDIT_STORE_SUBMITTED',
                    action_object=audit_store,
                    target=audit_store.audit
            )
            notify.send(
                    audit_store.user,
                    recipient=audit_store.user,
                    verb='AUDIT_STORE_SUBMITTED',
                    action_object=audit_store,
                    target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be submitted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def complete(audit_store_id):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.SUBMITTED:
            audit_store.status = AuditStore.COMPLETED
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                audit_store.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_COMPLETED',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                    audit_store.user,
                    recipient=audit_store.user,
                    verb='AUDIT_STORE_COMPLETED',
                    action_object=audit_store,
                    target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be completed now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def fail(audit_store_id):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.SUBMITTED:
            audit_store.status = AuditStore.FAILED
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                audit_store.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_FAILED',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                    audit_store.user,
                    recipient=audit_store.user,
                    verb='AUDIT_STORE_FAILED',
                    action_object=audit_store,
                    target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be failed now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

@atomic
def unsubmit(audit_store_id):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)

        if audit_store.status == AuditStore.SUBMITTED:
            audit_store.status = AuditStore.ASSIGNED
            audit_store.save()
            #TODO:VERB should be encapsulated
            notify.send(
                audit_store.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_STORE_UNSUBMITTED',
                action_object=audit_store,
                target=audit_store.audit
            )
            notify.send(
                    audit_store.user,
                    recipient=audit_store.user,
                    verb='AUDIT_STORE_UNSUBMITTED',
                    action_object=audit_store,
                    target=audit_store.audit
            )
            return audit_store
        else:
            raise AppLogicError("audit store cannot be unsubmitted now")
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e
