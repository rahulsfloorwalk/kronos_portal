from django.db import connection
from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.db.models import Q
from django.contrib.auth.models import User, Group

from notifications.signals import notify
from notifications.models import Notification

from manager.notification import verbs
from manager import notification

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from notify.service import mail_notify

from kronos.exceptions import ObjectNotFound, AppLogicError
from auditor.models import ProfileInfo, AuditApplication, AdditionalInfo
from rest_framework.exceptions import ValidationError
from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from auditor.models import AuditApplication
from manager.models import City
from manager.service import geo

def save(audit):
    try:
        audit.save()
        return audit
    except IntegrityError as e:
        raise AppLogicError("store is already added to this audit cycle") from e


def get_available_audits(profileinfo_id):
    profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
    if profileinfo.is_complete():
        active_audits = Audit.objects.filter(
            audit_cycle__status__in=[AuditCycle.UPCOMING, AuditCycle.ACTIVE])
        available_audits = active_audits.filter(
            Q(audit_cycle__type__in=[AuditCycle.WEB, AuditCycle.PHONE]) |
            Q(store__location__city_id=profileinfo.city.id)
        )
        return available_audits
    else:
        raise AppLogicError("please complete your personal information to view audits")


def get_available_audits_within_box(profileinfo_id, city_id=None, kms=None):
    try:
        if kms is not None: kms = int(kms)
    except ValueError:
        kms = None

    try:
        if city_id is not None: city_id = int(city_id)
    except ValueError:
        city_id = None

    try:
        profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)

        if profileinfo.is_complete():
            if kms is None:
                try:
                    addl_info = AdditionalInfo.objects.get(user_id=profileinfo.user_id)
                    kms = addl_info.distance
                except AdditionalInfo.DoesNotExist as e:
                    pass

            if kms not in [1,5,10,20,50,100]:
                kms=50 ## default distance to search for

            if city_id is None:
                city_id = profileinfo.city_id

            city = City.objects.get(pk=city_id)

            active_audits = Audit.objects.filter(
                audit_cycle__status__in=[
                    AuditCycle.UPCOMING,
                    AuditCycle.ACTIVE
                ]
            )

            ## get the bounding box
            lon_max, lon_min, lat_max, lat_min = geo.bounding_box(city.lat, city.lon, kms)

            available_audits = active_audits.filter(
                #Q(audit_cycle__type__in=[AuditCycle.WEB, AuditCycle.PHONE]) |
                Q(
                    store__location__city__lat__lte=lat_max,
                    store__location__city__lat__gte=lat_min,
                    store__location__city__lon__lte=lon_max,
                    store__location__city__lon__gte=lon_min
                )
            )
            return available_audits
        else:
            raise AppLogicError("please complete your personal information to view audits")
    except (ProfileInfo.DoesNotExist, City.DoesNotExist) as e:
        raise ObjectNotFound from e


def get_applied_audits(profileinfo_id):
    profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
    if profileinfo.is_complete():
        audits = Audit.objects.filter(audit_cycle__status__in=[AuditCycle.UPCOMING, AuditCycle.ACTIVE])
        return [audit for audit in audits if not audit.applications.filter(profileinfo_id=profileinfo_id).exists()]
    else:
        raise AppLogicError("please complete your personal information to view audits")

def get_applications( profileinfo_id):
    return AuditApplication.objects.filter(profileinfo_id=profileinfo_id)

def get_application( audit_id, location_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        audit_location = audit.auditlocations.get(location_id=location_id)
        return audit_location.applications.get(profileinfo_id=profileinfo_id);
    except (Audit.DoesNotExist, AuditLocation.DoesNotExist, AuditApplication.DoesNotExist) as e:
        raise ObjectNotFound from e

@atomic
def apply( audit_id, profileinfo_id, audit_date):
    try:
        audit = Audit.objects.get(id=audit_id)
        profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
        application = audit.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, ProfileInfo.DoesNotExist) as e:
        raise ObjectNotFound from e
    except AuditApplication.DoesNotExist:
        application = AuditApplication()
        application.status = AuditApplication.NOT_APPLIED
        application.profileinfo_id = profileinfo_id
        application.audit_id = audit.id

    if audit.audit_cycle.status != AuditCycle.ARCHIVED and application.status == AuditApplication.NOT_APPLIED or application.status is None:
        application.status = AuditApplication.APPLIED
        application.audit_date = audit_date
        application.save()
        #TODO:VERB should be encapsulated
        notify.send(
                profileinfo.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb=notification.AUDIT_APPLICATION_APPLIED,
                action_object=application,
                target=audit
        )
        notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_APPLIED).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(notif_id))
        notify.send(
            profileinfo.user,
            recipient=profileinfo.user,
            verb=notification.AUDIT_APPLICATION_APPLIED,
            action_object=application,
            target=audit
        )
        notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_APPLIED).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(notif_id))
        return application
    else:
        raise AppLogicError("you cannot apply to this audit")


@atomic
def cancel( audit_id, profileinfo_id):
    try:
        audit = Audit.objects.get(id=audit_id)
        profileinfo = ProfileInfo.objects.get(pk=profileinfo_id)
        application = audit.applications.get(profileinfo_id=profileinfo_id)
    except (Audit.DoesNotExist, AuditApplication.DoesNotExist, ProfileInfo.DoesNotExist ) as e:
        raise ObjectNotFound from e

    if audit.audit_cycle.status != AuditCycle.ARCHIVED and application.status == AuditApplication.APPLIED:
        application.status = AuditApplication.NOT_APPLIED
        application.save()
        #TODO:VERB should be encapsulated
        notify.send(
                profileinfo.user,
                recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
                verb='AUDIT_APPLICATION_CANCELED',
                action_object=application,
                target=audit
        )
        notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_CANCELED).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(notif_id))
        notify.send(
            profileinfo.user,
            recipient=profileinfo.user,
            verb='AUDIT_APPLICATION_CANCELED',
            action_object=application,
            target=audit
        )
        notif_id = Notification.objects.filter(verb=notification.AUDIT_APPLICATION_CANCELED).order_by('-id')[0].id
        connection.on_commit(lambda: mail_notify.send_notification_mail(notif_id))
        return application
    else:
        raise AppLogicError("you cannot cancel this application now")


@atomic
def fiat_assign(audit_id, email, audit_date, user_actor):
    try:
        user = User.objects.get(email__iexact=email)
        audit = Audit.objects.get(pk=audit_id)
        audit_cycle = audit.audit_cycle
    except (Audit.DoesNotExist, AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e
    except (User.DoesNotExist) as e:
        raise AppLogicError("email is not valid") from e

    if audit_date < audit.audit_cycle.start_date or audit_date > audit.audit_cycle.end_date:
        raise AppLogicError("audit date is out of range")
    if audit_cycle.status == AuditCycle.ARCHIVED:
        raise AppLogicError("audit_cycle is archived")

    audit_store = AuditStore()
    audit_store.audit_id = audit.id
    audit_store.audit_date = audit_date
    audit_store.status = AuditStore.ASSIGNED
    audit_store.user_id = user.id

    audit_store.save()
    #TODO:VERB should be encapsulated
    notify.send(
        user_actor,
        recipient=Group.objects.get(name=GROUP_NAME_MANAGER),
        verb='AUDIT_STORE_FIAT_ASSIGNED',
        action_object=audit_store,
        target=audit
    )
    notif_id = Notification.objects.filter(verb=notification.AUDIT_STORE_FIAT_ASSIGNED).order_by('-id')[0].id
    connection.on_commit(lambda: mail_notify.send_notification_mail(notif_id))
    notify.send(
        user_actor,
        recipient=audit_store.user,
        verb='AUDIT_STORE_FIAT_ASSIGNED',
        action_object=audit_store,
        target=audit
    )
    notif_id = Notification.objects.filter(verb=notification.AUDIT_STORE_FIAT_ASSIGNED).order_by('-id')[0].id
    connection.on_commit(lambda: mail_notify.send_notification_mail(notif_id))
    return audit_store

def get_latest_audit_cycle_for_client(client_id, audit_cycle_type):
    if audit_cycle_type is None:
        try:
            return AuditCycle.objects.filter(client_id=client_id).order_by('-end_date')[0]
        except IndexError as e:
            raise ObjectNotFound('Audit cycle not available')
    else:
        try:
            return AuditCycle.objects.filter(client_id=client_id, type=audit_cycle_type).order_by('-end_date')[0]
        except IndexError as e:
            raise ObjectNotFound('Audit cycle not available')
