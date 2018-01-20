import math

from django.contrib.auth.models import User

from audit_store.models import AuditStore
from auditor.models import AuditApplication, ProfileInfo
from kronos.exceptions import ObjectNotFound
from payment.models import Payment
from registration.models import GROUP_NAME_AUDITOR
from auditor.service import profile_info_service
from auditor.service import bank_info_service
from auditor.service import additional_info_service
import attachment.service_auditor as auditor_attachment_service
from social.service import social_auditor


def getAuditorHistoryStats(user_id):

    try:
        auditor = User.objects.get(pk=user_id)
        if auditor and auditor.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            profileInfo = ProfileInfo.objects.get(user=auditor)
            audit_applications = AuditApplication.objects.filter(profileinfo=profileInfo).order_by('-audit_date')
            audit_stores = AuditStore.objects.filter(user=auditor).order_by('-audit_date')
            result = {}
            result['application'] = []
            result['audit_store'] = []
            result['summary'] = {}
            for app in audit_applications:
                obj = {}
                obj['id'] = app.id
                obj['store'] = app.audit.store.name
                obj['audit_cycle_id'] = app.audit.audit_cycle.id
                obj['audit_cycle'] = app.audit.audit_cycle.name
                obj['client'] = app.audit.audit_cycle.client.name
                obj['date'] = app.audit_date
                obj['status'] = app.status
                result.get('application').append(obj)

            for rep in audit_stores:
                obj = {}
                obj['id'] = rep.id
                obj['store'] = rep.audit.store.name
                obj['audit_cycle_id'] = rep.audit.audit_cycle.id
                obj['audit_cycle'] = rep.audit.audit_cycle.name
                obj['client'] = rep.audit.audit_cycle.client.name
                obj['date'] = rep.audit_date
                obj['status'] = rep.status
                result.get('audit_store').append(obj)
            for audit_store in audit_stores:
                if result.get('summary').get(audit_store.status):
                    result.get('summary')[audit_store.status] += 1
                else:
                    result.get('summary')[audit_store.status] = 1
            return result
        else:
            raise ObjectNotFound
    except User.DoesNotExist:
        raise ObjectNotFound

def getAuditApplications(user_id):
    try:
        auditor = User.objects.get(pk=user_id)
        if auditor and auditor.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            profileInfo = ProfileInfo.objects.get(user=auditor)
            audit_applications = AuditApplication.objects.filter(profileinfo=profileInfo).order_by('-audit_date')  \
                .values('id', 'audit__store__name', 'audit__audit_cycle__id', 'audit__audit_cycle__name',
                        'audit__audit_cycle__client__name', 'audit_date', 'status').all()
            return audit_applications
    except User.DoesNotExist:
        raise ObjectNotFound


def getAuditStores(user_id):
    try:
        auditor = User.objects.get(pk=user_id)
        if auditor and auditor.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            audit_stores = AuditStore.objects.filter(user=auditor).order_by('-audit_date')  \
                .values('id', 'audit__store__name', 'audit__audit_cycle__id', 'audit__audit_cycle__name',
                        'audit__audit_cycle__client__name', 'audit_date', 'status', 'qa_rating').all()
            return audit_stores
    except User.DoesNotExist:
        raise ObjectNotFound


def getAuditorStats(user_id):
    try:
        auditor = User.objects.get(pk=user_id)
        if auditor and auditor.groups.filter(name=GROUP_NAME_AUDITOR).exists():
            profileInfo = ProfileInfo.objects.get(user=auditor)
            audit_applications = AuditApplication.objects.filter(profileinfo=profileInfo).order_by('-audit_date')
            audit_stores = AuditStore.objects.filter(user=auditor).order_by('-audit_date')
            payments = Payment.objects.filter(user=auditor)
            result = {
                'applied': 0,
                'assigned': 0,
                'completed': 0,
                'pending_payment': 0
            }
            result['applied'] = len(audit_applications)

            for audit_store in audit_stores:
                if audit_store.status == AuditStore.ACCEPTED:
                    result['completed'] += 1
                    result['assigned'] += 1
                    continue
                elif audit_store.status == AuditStore.WITHDRAWN:
                    continue
                else:
                    result['assigned'] += 1

            for payment in payments:
                if payment.status == Payment.PENDING:
                    result['pending_payment'] += 1
            return result
        else:
            raise ObjectNotFound
    except User.DoesNotExist:
        raise ObjectNotFound

def getAuditorScore(user_id):
    return {}


def get_profile_percentage(user_id):
    profile_percentage = 0

    profile_info = profile_info_service.find_profile_info_by_user_id(user_id)
    if profile_info.is_complete():
        profile_percentage += 0.25

    bank_info = bank_info_service.find_bank_info_by_user_id(user_id)
    if bank_info.is_complete():
        profile_percentage += 0.25

    addl_indo = additional_info_service.find_additional_info_by_user_id(user_id)
    addl_percentage = addl_indo.completed_field_count() / addl_indo.field_count()
    profile_percentage += addl_percentage * 0.10

    attachments = auditor_attachment_service.find_id_proof_for_auditor(user_id)
    if len(attachments) > 0:
        profile_percentage += 0.20

    fb = social_auditor.find_facebook_by_user(user_id)
    if fb.is_verified:
        profile_percentage += 0.20

    return math.floor(profile_percentage * 100)
