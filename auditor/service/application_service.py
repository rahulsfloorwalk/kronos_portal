from django.contrib.auth.models import Group
from django.db.transaction import atomic
from django.db.models import Count, F
from notifications.models import Notification
from notifications.signals import notify

from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from auditor.models import AuditApplication, ProfileInfo
from kronos.exceptions import ObjectNotFound, AppLogicError
from notify.service import mail_notify
from notify import verbs
from registration.models import GROUP_NAME_MANAGER
from audit.service import audit_service
from audit.service import audit_cycle as audit_cycle_service

from auditor.service import profile_info_service
from auditor.service import bank_info_service
from auditor.service import preferences_service
from kronos.utils import today_ist
from datetime import timedelta


def get_applications(profileinfo_id):
    return AuditApplication.objects.filter(profileinfo_id=profileinfo_id)

def get_application(audit_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        return audit.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, AuditApplication.DoesNotExist) as e:
        raise ObjectNotFound from e

def apply(audit_id, user_id, audit_date):
    with atomic():
        try:
            audit = Audit.objects.get(id=audit_id)
            profile_info = profile_info_service.find_profile_info_by_user_id(user_id)
            bank_info = bank_info_service.find_bank_info_by_user_id(user_id)
            preferences = preferences_service.find_preferences_by_user_id(user_id)
            application = audit.applications.get(profileinfo_id=profile_info.id)
        except (Audit.DoesNotExist) as e:
            raise ObjectNotFound from e
        except AuditApplication.DoesNotExist:
            application = AuditApplication()
            application.status = AuditApplication.NOT_APPLIED
            application.profileinfo = profile_info
            application.audit_id = audit.id

        if not preferences.pp_accepted or not preferences.agreement_accepted:
            raise AppLogicError("Please accept the Privacy Policy and Individual Contractor Agreement before applying to audits.")

        if not profile_info.is_complete():
            raise AppLogicError("Please complete all required fields under PROFILE SECTION")

        if not bank_info.is_complete():
            raise AppLogicError("Please complete all required fields under PAYMENT DETAILS Section")
        # if bank_info.is_complete() and not bank_info.is_valid():
            # raise AppLogicError("Please enter VALID INFORMATION under BANK DETAILS Section")

        if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
            raise AppLogicError("preferred audit date is not within range")

        if audit.audit_cycle.status not in (AuditCycle.PREPARATION, AuditCycle.ARCHIVED) and application.status == AuditApplication.NOT_APPLIED or application.status == AuditApplication.WITHDRAWN or application.status is None:
            application.status = AuditApplication.APPLIED
            application.audit_date = audit_date
            report_exists = previous_report_exists(profile_info, audit, audit_date)
            if report_exists:
                # application.report_exists = True
                application.report_exists_data = {
                    'audit_cycle_id': report_exists.audit.audit_cycle.id,
                    'audit_cycle_name': report_exists.audit.audit_cycle.name,
                    'audit_date': report_exists.audit_date.strftime('%Y-%m-%d'),
                }
            else:
                application.report_exists = False
            application.apply_count+=1
            application.save()
            notify.send(
                profile_info.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_APPLICATION_APPLIED,
                action_object=application,
                target=audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_APPLIED).order_by('-id')[0].id
            notify.send(
                profile_info.user,
                recipient=profile_info.user,
                verb=verbs.AUDIT_APPLICATION_APPLIED,
                action_object=application,
                target=audit
            )
            # if audit.audit_cycle.audit_auto_approve:
            #     audit_count = 1
            #     auto_approve = False
            #     application = approve(application.id, audit_date, audit.reimbursement, audit.earnings_per_audit, audit_count, profile_info.user, auto_approve)
            # auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_APPLIED).order_by('-id')[0].id
        else:
            raise AppLogicError("you cannot apply to this audit")
    mail_notify.send_notification_mail(manager_notif_id, "")
    # mail_notify.send_notification_mail(auditor_notif_id, "")
    return application


def cancel(audit_id, user_id):
    with atomic():
        try:
            audit = Audit.objects.get(id=audit_id)
            profileinfo = profile_info_service.find_profile_info_by_user_id(user_id)
            application = audit.applications.get(profileinfo=profileinfo)
        except (Audit.DoesNotExist, AuditApplication.DoesNotExist) as e:
            raise ObjectNotFound from e

        if audit.audit_cycle.status not in (AuditCycle.PREPARATION, AuditCycle.REPORT, AuditCycle.ARCHIVED) and application.status in (AuditApplication.APPLIED, AuditApplication.WAITLISTED):
            application.status = AuditApplication.NOT_APPLIED
            application.save()
            notify.send(
                profileinfo.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=verbs.AUDIT_APPLICATION_CANCELED,
                action_object=application,
                target=audit
            )
            manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_CANCELED).order_by('-id')[0].id
            notify.send(
                profileinfo.user,
                recipient=profileinfo.user,
                verb=verbs.AUDIT_APPLICATION_CANCELED,
                action_object=application,
                target=audit
            )
            auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_CANCELED).order_by('-id')[0].id
        else:
            raise AppLogicError("you cannot cancel this application now")
    mail_notify.send_notification_mail(manager_notif_id, "")
    # mail_notify.send_notification_mail(auditor_notif_id, "")
    return application


def approve(application_id, audit_date, reimbursement, earnings_per_audit, audit_count, user_actor, auto_approve=False,instant_approve=False):
    with atomic():
        try:
            application = AuditApplication.objects.get(id=application_id)
            audit = application.audit
            audit_cycle = audit.audit_cycle
        except (AuditApplication.DoesNotExist, Audit.DoesNotExist, AuditCycle.DoesNotExist, ProfileInfo.DoesNotExist):
            raise ObjectNotFound

        if application.status not in (AuditApplication.APPLIED, AuditApplication.WAITLISTED):
            raise AppLogicError("application cannot be approved right now")
        if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
            raise AppLogicError("audit date is out of range")
        if audit_cycle.status in (AuditCycle.PREPARATION, AuditCycle.ARCHIVED):
            raise AppLogicError("application cannot be approved right now")

        application.status = AuditApplication.APPROVED
        application.audit_date = audit_date
        application.save()
        notify.send(
            user_actor,
            recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
            verb=verbs.AUDIT_APPLICATION_APPROVED,
            action_object=application,
            target=application.audit
        )
        notify.send(
            user_actor,
            recipient=application.profileinfo.user,
            verb=verbs.AUDIT_APPLICATION_APPROVED,
            action_object=application,
            target=application.audit
        )
        for _ in range(audit_count):
            if audit_cycle.check_points:
                check_points = audit_cycle.check_points
                checkpoints_list = check_points.split(";")
                check_points_id = 1
                checkpoints_dict = {}
                for i in checkpoints_list:
                    if i.strip():
                        checkpoints_dict[str(check_points_id)] = {"checkpoint": i.strip(), "value": False}
                        check_points_id += 1
            else:
                checkpoints_dict = {}

            AuditStore.objects.assign_audit_store(audit, application.audit_date, application.profileinfo.user, reimbursement, earnings_per_audit, checkpoints_dict, user_actor, auto_assigned=auto_approve,instant_assigned=instant_approve)
    return application

def reject(application_id, user_actor):
    with atomic():
        try:
            application = AuditApplication.objects.get(id=application_id)
        except (AuditApplication.DoesNotExist):
            raise ObjectNotFound

        if application.status not in (AuditApplication.APPLIED, AuditApplication.WAITLISTED):
            raise AppLogicError("application cannot be rejected now")

        application.status = AuditApplication.REJECTED
        application.save()
        notify.send(
            user_actor,
            recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
            verb=verbs.AUDIT_APPLICATION_REJECTED,
            action_object=application,
            target=application.audit
        )
        manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_REJECTED).order_by('-id')[0].id
        notify.send(
            user_actor,
            recipient=application.profileinfo.user,
            verb=verbs.AUDIT_APPLICATION_REJECTED,
            action_object=application,
            target=application.audit
        )
        auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_REJECTED).order_by('-id')[0].id
    mail_notify.send_notification_mail(manager_notif_id, "")
    mail_notify.send_notification_mail(auditor_notif_id, "")
    return application

def waitlist(application_id, user_actor):
    with atomic():
        try:
            application = AuditApplication.objects.get(id=application_id)
        except (AuditApplication.DoesNotExist, Audit.DoesNotExist, AuditCycle.DoesNotExist, ProfileInfo.DoesNotExist):
            raise ObjectNotFound

        if application.status != AuditApplication.APPLIED:
            raise AppLogicError("application cannot be waitlisted now")

        application.status = AuditApplication.WAITLISTED
        application.save()
        notify.send(
            user_actor,
            recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
            verb=verbs.AUDIT_APPLICATION_WAITLISTED,
            action_object=application,
            target=application.audit
        )
        manager_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_WAITLISTED).order_by('-id')[0].id
        notify.send(
            user_actor,
            recipient=application.profileinfo.user,
            verb=verbs.AUDIT_APPLICATION_WAITLISTED,
            action_object=application,
            target=application.audit
        )
        auditor_notif_id = Notification.objects.filter(verb=verbs.AUDIT_APPLICATION_WAITLISTED).order_by('-id')[0].id
    mail_notify.send_notification_mail(manager_notif_id, "")
    mail_notify.send_notification_mail(auditor_notif_id, "")
    return application


def find_applications_by_audit(audit_id):
    return audit_service.find_audit_by_id(audit_id).applications.exclude(status=AuditApplication.NOT_APPLIED).order_by('audit_date')

def find_application_by_id(application_id):
    try:
        return AuditApplication.objects.get(pk=application_id)
    except AuditApplication.DoesNotExist as e:
        raise ObjectNotFound from e

def set_application_comment(application_id: int, comment: str):
    if not comment:
        raise AppLogicError('Please enter a comment')
    application = find_application_by_id(application_id)
    application.comment = comment
    application.save()
    return application

@atomic
def reject_all_applications_for_audit(audit_id, user_actor):
    audit = audit_service.find_audit_by_id(audit_id)
    return [reject(a.id, user_actor) for a in audit.applications.filter(status=AuditApplication.APPLIED)]


@atomic
def reject_all_applications_for_audit_cycle(audit_cycle_id, user_actor):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    applications = []
    for audit in audit_cycle.audits.all():
        applications.extend(reject_all_applications_for_audit(audit.id, user_actor))
    return applications


def get_application_stats(audit_cycle_id):
    return AuditApplication.objects.filter(audit__audit_cycle__id=audit_cycle_id).values('status').annotate(count=Count('status'))


def previous_report_exists(profile_info, audit, audit_date):
    start_date = audit_date - timedelta(days = 180)
    return profile_info.user.auditstore_set.filter(audit__store=audit.store, audit_date__range=[start_date, audit_date], status = AuditStore.ACCEPTED).only('audit__audit_cycle', 'audit_date').last()


def change_application_status_to_withdrawn(audit_store_id):
    audit_store_obj = AuditStore.objects.get(id=audit_store_id)
    audit_id = audit_store_obj.audit.id
    user_id = audit_store_obj.user.id
    if AuditApplication.objects.filter(audit__id=audit_id, profileinfo__user__id=user_id):
        audit_application_obj = AuditApplication.objects.get(audit__id=audit_id, profileinfo__user__id=user_id)
        audit_application_obj.status = AuditApplication.WITHDRAWN
        return audit_application_obj
    return None


def find_15_days_applied_audit_applications():
    return AuditApplication.objects.filter(
        created_at__date__lte=today_ist() - timedelta(days=15),
        status=AuditApplication.APPLIED,
        audit__audit_cycle__status=AuditCycle.ACTIVE)


def find_20_days_waitlist_audit_applications():
    return AuditApplication.objects.filter(
        created_at__date__lte=today_ist() - timedelta(days=20),
        status=AuditApplication.WAITLISTED,
        audit__audit_cycle__status=AuditCycle.ACTIVE)


def find_audit_applications_for_auto_approve():

    audit_application = AuditApplication.objects.select_related('audit', 'audit__audit_cycle', 'profileinfo').filter(
        audit__hidden = False,
        audit_date__gte=today_ist() + timedelta(days=1),
        report_exists=False,
        status__in=[AuditApplication.APPLIED, AuditApplication.WAITLISTED],
        audit_date__gt=F('audit__audit_cycle__start_date'),
        audit_date__lt=F('audit__audit_cycle__end_date'),
        audit__audit_cycle__audit_auto_approve = True,
        audit__audit_cycle__status=AuditCycle.ACTIVE).order_by('id')

    audit_obj_list = Audit.objects.filter(audit_cycle__status=AuditCycle.ACTIVE, audit_cycle__audit_auto_approve = True, hidden = False)

    application_id_list = []
    for audit in audit_obj_list:
        valid_audit_count = 0
        if audit.valid_report_count() < audit.count:
            range = audit.count - audit.valid_report_count()
            audit_application_filtered = audit_application.filter(audit=audit.id)

            for application in audit_application_filtered:
                # rating=profile_info_service.get_avg_auditor_rating_by_user(application.profileinfo.user)
                distance=application.distance()
                total_factors_count, valid_factors_count, match_percent = application.validate_alignment_factors()
                # required minimum 3 alignment factors in audit cycle
                if distance is not None:
                    if (match_percent <= 100 and match_percent >= 85) and int(distance)<=10 :
                        if application.audit_date == today_ist()+timedelta(days=1):
                            application_id_list.append(application.id)
                            valid_audit_count += 1
                        if valid_audit_count == range:
                            break
                    elif (match_percent<=84 and match_percent >=70) and int(distance)<=20 :
                        if application.audit_date == today_ist()+timedelta(days=1):
                            application_id_list.append(application.id)
                            valid_audit_count += 1
                        if valid_audit_count == range:
                            break
                    elif (match_percent<=69 and match_percent >=55) and int(distance)<=30 :
                        if application.audit_date == today_ist()+timedelta(days=1):
                            application_id_list.append(application.id)
                            valid_audit_count += 1
                        if valid_audit_count == range:
                            break
    return audit_application.filter(id__in = application_id_list)
