from kronos.exceptions import ObjectNotFound

from ..models import BankInfo, Client, ClientUser,NonClientAdminUserStore
from audit.models.audit_cycle import AuditCycle
from audit.models import Audit
from audit_store.models import AuditStore,ReportActionPlan
from django.contrib.auth.models import Group,User
from registration.models import GROUP_NAME_CLIENT
from django.utils import timezone
def find_client_user_by_audit_store_id(audit_store_id):
    audit_store=AuditStore.objects.get(id=audit_store_id)
    client_users= NonClientAdminUserStore.objects.filter(stores__store_list__contains=audit_store.audit.store_id)
    result=[]
    for i in client_users:
        result.append({'email':i.client_user.user.email,'full_name':i.client_user.full_name})
    return result

def find_client_by_id(client_id):
    try:
        return Client.objects.get(id=client_id)
    except Client.DoesNotExist as e:
        raise ObjectNotFound from e

def find_audit_store_by_client_id_for_target_date(client_id):
    try:
        audit_store=AuditStore.objects.filter(audit__audit_cycle__client_id=client_id)
        result=[]
        if audit_store:
            for i in audit_store:
                result.append(i.id)
        return result
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e

def report_action_by_audit_store_id(audit_store_id):
    try:
        return ReportActionPlan.objects.filter(target_date=timezone.now().date(),status=ReportActionPlan.PENDING,audit_store_id=audit_store_id)
    except ReportActionPlan.DoesNotExist as e:
        raise ObjectNotFound from e

def find_client_user_by_email_id(email):
    try:
        return Group.objects.get(name=GROUP_NAME_CLIENT).user_set.get(email=email)
    except(Group.DoesNotExist, User.DoesNotExist) as e:
        raise ObjectNotFound from e

def find_client_by_user_id(user_id):
    try:
        return ClientUser.objects.get(user_id=user_id).client
    except Client.DoesNotExist as e:
        raise ObjectNotFound from e

def find_client_user_full_name_and_email(email):
    try:
        user = User.objects.get(email=email)
        client_user = ClientUser.objects.get(user=user)
        return client_user
    except User.DoesNotExist:
        return None
    except ClientUser.DoesNotExist:
        return None

def find_bank_info_by_id(client_id):
    try:
        return BankInfo.objects.get(client_id=client_id)
    except BankInfo.DoesNotExist as e:
        return BankInfo(client_id=client_id)


def find_all_clients():
    return Client.objects.all()

def find_all_clients_if_true():
    return Client.objects.filter(is_active=True)


def save(client):
    client.save()
    return client


def update_receive_email_notification(client_id, receive_email_notification):
    client = find_client_by_id(client_id)
    client.receive_email_notification = receive_email_notification
    client.save()
    return client

def find_client_by_dashboard_cycle_status():
    return Client.objects.filter(audits__status__in = AuditCycle.MANAGER_DASHBOARD_STATUSES).distinct('id').order_by('id')

def find_client_by_active_cycle_status():
    return Client.objects.filter(audits__status = AuditCycle.ACTIVE).distinct('id').order_by('id')