from kronos.exceptions import ObjectNotFound

from ..models import BankInfo, Client, ClientUser,NonClientAdminUserStore,ClientRequirements,ClientModerator
from audit.models.audit_cycle import AuditCycle
from audit.models import Audit
from audit_store.models import AuditStore,ReportActionPlan
from django.contrib.auth.models import Group,User
from registration.models import GROUP_NAME_CLIENT
from django.utils import timezone
from manager.models import ManagerProfileInfo
# from audit_store.service import qa_not_assign
from guardian.shortcuts import get_objects_for_user
from django.contrib.auth import get_user_model

# def find_client_user_by_audit_store_id(audit_store_id):
#     audit_store=AuditStore.objects.get(id=audit_store_id)
#     client_users= NonClientAdminUserStore.objects.filter(stores__store_list__contains=audit_store.audit.store_id)
#     result=[]
#     for i in client_users:
#         result.append({'email':i.client_user.user.email,'full_name':i.client_user.full_name})
#     return result

def find_client_user_by_audit_store_id(audit_store_id):
    audit_store = AuditStore.objects.select_related('audit__store').get(id=audit_store_id)
    client_users = NonClientAdminUserStore.objects.filter( stores__store_list__contains=audit_store.audit.store_id).select_related( 'client_user__user')
    result=[]
    for i in client_users:
        result.append({'email':i.client_user.user.email,'full_name':i.client_user.full_name})
    return result

def find_client_user_email_by_audit_store_id(audit_store_id):
    audit_store=AuditStore.objects.get(id=audit_store_id)
    client_users= NonClientAdminUserStore.objects.filter(stores__store_list__contains=audit_store.audit.store_id)
    result=[]
    for i in client_users:
        user = i.client_user.user
        if user.is_active:
            result.append({'email':i.client_user.user.email})
    return result

def find_non_admin_user_emails_by_audit_store_id(audit_store_id):
    try:
        audit_store = AuditStore.objects.get(id=audit_store_id)
    except AuditStore.DoesNotExist:
        return []
    matched_mappings= NonClientAdminUserStore.objects.filter(stores__store_list__contains=audit_store.audit.store_id)
    email_list = []
    for m in matched_mappings:
        user = m.client_user.user
        if user.is_active:
            if not m.client_user.is_client_admin():
                email_list.append(user.email)
    return email_list

def find_client_by_id(client_id):
    try:
        return Client.objects.get(id=client_id)
    except Client.DoesNotExist as e:
        raise ObjectNotFound from e

def find_client_moderators_with_filters(client_id, audit_cycle_id=None,
                                        user_id='', city='', status='', qa_id=''):
    from audit_store.service import qa_not_assign
    from guardian.shortcuts import get_users_with_perms, get_objects_for_user

    client_moderators = ClientModerator.objects.filter(
        client_id=client_id,
        is_active=True,
        user__is_active=True
    ).select_related('user')

    if not audit_cycle_id:
        return client_moderators

    audit_stores = AuditStore.objects.filter(
        audit__audit_cycle_id=audit_cycle_id
    )

    if user_id:
        audit_stores = audit_stores.filter(user_id=user_id)

    if city:
        audit_stores = audit_stores.filter(
            audit__store__city__name=city
        )

    if status:
        audit_stores = audit_stores.filter(
            status=status
        )

    # If QA is selected, keep only AuditStores assigned to that QA.
    if qa_id:
        try:
            qa_user = User.objects.get(id=qa_id)
        except User.DoesNotExist:
            return client_moderators.none()

        audit_stores = get_objects_for_user(
            qa_user,
            'moderator_manage',
            klass=audit_stores
        )

    # Get users who have AuditStores matching the selected filters.
    filtered_user_ids = audit_stores.values_list(
        'user_id',
        flat=True
    ).distinct()

    # IMPORTANT:
    # ClientModerator.user is the QA user.
    #
    # We need to find which QA users are actually assigned
    # to the filtered AuditStores.
    qa_user_ids = set()

    for audit_store in audit_stores:
        users_with_perms = get_users_with_perms(
            audit_store,
            attach_perms=True
        )

        for user, perms in users_with_perms.items():
            if 'moderator_manage' in perms:
                qa_user_ids.add(user.id)

    return client_moderators.filter(
        user_id__in=qa_user_ids
    )

def find_client_requirements_by_client_id(client_id):
    try:
        return ClientRequirements.objects.filter(client=client_id)
    except ClientRequirements.DoesNotExist as e:
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

# def find_all_clients_if_true():
#     return Client.objects.filter(is_active=True)

# def find_all_clients_if_true():
#     return Client.objects.filter(
#         is_active=True,
#         managers__is_active=True,
#         managers__receive_email_notification=True
#     ).distinct()

def find_all_clients_if_true(user):
    try:
        manager_profile_info = ManagerProfileInfo.objects.get(user=user)
        if manager_profile_info.is_admin:
            # Return all clients if manager is_admin is True
            return Client.objects.filter(is_active=True)
        else:
            # Return filtered clients based on manager conditions
            return Client.objects.filter(
                is_active=True,
                managers__user=user,
                managers__is_active=True,
                managers__receive_email_notification=True
            ).distinct()
    except ManagerProfileInfo.DoesNotExist:
        # Handle the case where ManagerProfileInfo doesn't exist for the user
        return Client.objects.none()



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