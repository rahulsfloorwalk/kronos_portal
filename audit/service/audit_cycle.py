from django.contrib.auth.models import User

from guardian.shortcuts import get_objects_for_user

from kronos.exceptions import AppLogicError, ObjectNotFound
from kronos.utils import validate_date_range_from_string

from registration.service.moderator import find_moderator_by_user_id
from client.service.client_user import find_clientuser_by_user_id
from attachment.models import Attachment
from ..models import AuditCycle
from client.models import MPOrder
from auditor.models import AuditApplication
from audit_store.models import AuditStore
from . import audit_cycle_proof_tag
from manager.models import ManagerProfileInfo
from client.models import Client
from client.models import Store
from manager.models import City
from auditor.models import ProfileInfo, AdditionalInfo
from django.db.models import Prefetch
from manager.service import geo
from audit.service import audit_cycle as audit_cycle_service
import logging

logger = logging.getLogger(__name__)

def save(audit):
    AuditCycle.save(audit)
    return audit

def find_distinct_types_for_clientuser(user_id):
    user = find_clientuser_by_user_id(user_id)
    return AuditCycle.objects.filter(
        client_id=user.clientuser.client_id,
        status__in=AuditCycle.LIVE_REPORTING_STATUSES
    ).distinct('type').values_list('type', flat=True)

def find_by_id_for_clientuser(audit_cycle_id, user_id):
    try:
        user = find_clientuser_by_user_id(user_id)
        return AuditCycle.objects.get(client_id=user.clientuser.client_id, status__in=AuditCycle.LIVE_REPORTING_STATUSES, pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e

def find_by_audit_type_for_clientuser(audit_type, user_id):
    if audit_type not in [t[0] for t in AuditCycle.TYPES]:
        raise AppLogicError("Invalid Audit Type")
    try:
        user = find_clientuser_by_user_id(user_id)
        return AuditCycle.objects.filter(client_id=user.clientuser.client_id, status__in=AuditCycle.LIVE_REPORTING_STATUSES, type=audit_type).order_by('-end_date')
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e

def find_order_description_and_files_by_audit_cycle_id(audit_cycle_id):
    audit_cycle=find_by_id(audit_cycle_id)
    result=[]
    order= MPOrder.objects.get(id=audit_cycle.order.id)
    attachment=Attachment.objects.get(orders__id=order.id,status=Attachment.ATTACHED)
    attachments_data = []
    thumbnail_url = attachment.extra()["thumbnail_url"]
    preview_url = attachment.extra()["preview_url"]
    direct_url = attachment.direct_url()
    attachments_data.append({
        "id": attachment.id,
        "file_slug": attachment.file_slug,
        "proof_type": attachment.proof_type,
        "mime_type": attachment.mime_type,
        "file_name": attachment.file_name,
        "file_size": attachment.file_size,
        "status": attachment.status,
        "created_at": attachment.created_at,
        "modified_at": attachment.modified_at,
        "completed_at": attachment.completed_at,
        "attachment_id": attachment.attachment_id,
        "extra_properties": attachment.extra_properties,
        "audio_transcript_data": attachment.audio_transcript_data,
        "thumbnail_url": thumbnail_url,
        "preview_url": preview_url,
        "direct_url": direct_url
    })
    result.append({
        'describe':order.describe,
        "attachments":attachments_data
    }) 
    return result

def get_audit_cycle_stats(audit_cycle):
    applications = []
    stores = []
    for audit in audit_cycle.audits.all():
        applications.extend(audit.applications.all())
        stores.extend(audit.audit_stores.all())

    result = {}
    result['application'] = {}
    result['audit_store'] = {}
    for application in applications:
        if result.get('application').get(application.status):
            result.get('application')[application.status] += 1
        else:
            result.get('application')[application.status] = 1
    for store in stores:
        if result.get('audit_store').get(store.status):
            result.get('audit_store')[store.status] += 1
        else:
            result.get('audit_store')[store.status] = 1
    for key in AuditApplication.STATUS:
        if not result.get('application').get(key[0]):
            result.get('application')[key[0]] = 0
    for key in AuditStore.STATUS:
        if not result.get('audit_store').get(key[0]):
            result.get('audit_store')[key[0]] = 0
    return result

# def get_audit_cycle_dashboard():
#     audit_cycles = AuditCycle.objects.filter(
#         status__in=AuditCycle.MANAGER_DASHBOARD_STATUSES
#     ).order_by('end_date') \
#         .select_related('client') \
#         .prefetch_related(
#             'audits',
#             'audits__applications',
#             'audits__audit_stores',
#     )

#     response = []
#     for audit_cycle in audit_cycles:
#         obj = {}
#         obj['id'] = audit_cycle.id
#         obj['name'] = audit_cycle.name
#         obj['status'] = audit_cycle.status
#         obj['client'] = audit_cycle.client.name
#         obj['start_date'] = audit_cycle.start_date
#         obj['end_date'] = audit_cycle.end_date
#         obj['audit_count'] = audit_cycle.planned_audit
#         obj['stats'] = get_audit_cycle_stats(audit_cycle)
#         response.append(obj)

#     return response

def get_audit_cycle_dashboard(user):
    try:
        manager_profile_info = ManagerProfileInfo.objects.get(user=user)
        clients = get_clients_for_manager(manager_profile_info)

        audit_cycles = AuditCycle.objects.filter(
            status__in=AuditCycle.MANAGER_DASHBOARD_STATUSES,
            client__in=clients
        ).order_by('end_date') \
            .select_related('client') \
            .prefetch_related(
                'audits',
                'audits__applications',
                'audits__audit_stores',
        )

        response = []
        for audit_cycle in audit_cycles:
            obj = {}
            obj['id'] = audit_cycle.id
            obj['name'] = audit_cycle.name
            obj['status'] = audit_cycle.status
            obj['client'] = audit_cycle.client.name
            obj['start_date'] = audit_cycle.start_date
            obj['end_date'] = audit_cycle.end_date
            obj['audit_count'] = audit_cycle.planned_audit
            obj['stats'] = get_audit_cycle_stats(audit_cycle)
            response.append(obj)

        return response
    except ManagerProfileInfo.DoesNotExist:
        # Handle the case where ManagerProfileInfo doesn't exist for the user
        return []

def get_audit_cycle_dashboard_by_client_id(user, client_id=None, status=None):
    try:
        manager_profile_info = ManagerProfileInfo.objects.get(user=user)

        audit_cycles_query = AuditCycle.objects.filter(
            status__in=AuditCycle.MANAGER_DASHBOARD_STATUSES
        ).order_by('end_date') \
         .select_related('client') \
         .prefetch_related(
             'audits',
             'audits__applications',
             'audits__audit_stores',
         )

        if client_id:
            audit_cycles_query = audit_cycles_query.filter(client=client_id)
        if status and status != "undefined":
            audit_cycles_query = audit_cycles_query.filter(status=status)

        response = []
        for audit_cycle in audit_cycles_query:
            obj = {
                'id': audit_cycle.id,
                'name': audit_cycle.name,
                'status': audit_cycle.status,
                'client': audit_cycle.client.name,
                'start_date': audit_cycle.start_date,
                'end_date': audit_cycle.end_date,
                'audit_count': audit_cycle.planned_audit,
                'stats': get_audit_cycle_stats(audit_cycle),
            }
            response.append(obj)

        return response

    except ManagerProfileInfo.DoesNotExist:
        return []


def get_audit_cycle_dashboard_by_client_dropdown(user):
    try:
        manager_profile_info = ManagerProfileInfo.objects.get(user=user)
        clients = get_clients_for_manager(manager_profile_info)

        client_list = []
        for client in clients:
            audit_cycles_exist = AuditCycle.objects.filter(
                status__in=AuditCycle.MANAGER_DASHBOARD_STATUSES,
                client=client
            ).exists()
            if audit_cycles_exist:
                client_data = {
                    'id': client.id,
                    'name': client.name
                }
                client_list.append(client_data)

        return client_list
    except ManagerProfileInfo.DoesNotExist:
        return []

def get_clients_for_manager(manager_profile_info):
    if manager_profile_info.is_admin:
        # Return all clients if manager is_admin is True
        return Client.objects.filter(is_active=True)
    else:
        # Return filtered clients based on manager conditions
        return Client.objects.filter(
            is_active=True,
            managers__user=manager_profile_info.user,
            managers__is_active=True,
            managers__receive_email_notification=True
        ).distinct()


def get_audit_cycle_dashboard_by_client(client_id):
    audit_cycles = AuditCycle.objects.filter(
        client=client_id
    ).order_by('end_date') \
        .select_related('client') \
        .prefetch_related(
            'audits',
            'audits__applications',
            'audits__audit_stores',
    )

    response = []
    for audit_cycle in audit_cycles:
        obj = {}
        obj['id'] = audit_cycle.id
        obj['name'] = audit_cycle.name
        obj['status'] = audit_cycle.status
        obj['client'] = audit_cycle.client.name
        obj['start_date'] = audit_cycle.start_date
        obj['end_date'] = audit_cycle.end_date
        obj['audit_count'] = audit_cycle.planned_audit
        obj['stats'] = get_audit_cycle_stats(audit_cycle)
        response.append(obj)

    return response


def get_audit_cycle_dashboard_summary_by_client(client_id):
    summary = {
        'completed': 0,
        'acknowledge': 0,
        'submitted': 0,
        'assigned': 0,
    }
    reports = AuditStore.objects.filter(
        audit__audit_cycle__client=client_id,
        status__in=[AuditStore.COMPLETED, AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED]
    ).only('id', 'status')
    for report in reports:
        if report.status == AuditStore.COMPLETED:
            summary['completed'] = summary['completed'] + 1
        elif report.status == AuditStore.ACKNOWLEDGED:
            summary['acknowledge'] = summary['acknowledge'] + 1
        elif report.status == AuditStore.SUBMITTED:
            summary['submitted'] = summary['submitted'] + 1
        elif report.status == AuditStore.ASSIGNED:
            summary['assigned'] = summary['assigned'] + 1
    return summary


def find_audit_cycles_with_dashboard_status_by_client(client_id):
    return AuditCycle.objects.filter(client_id=client_id, status__in = AuditCycle.MANAGER_DASHBOARD_STATUSES).order_by('-end_date')

def find_for_moderator(user_id):
    try:
        user = find_moderator_by_user_id(user_id)
        query_set = AuditCycle.objects.filter(status__in=AuditCycle.MODERATOR_VISIBLE_STATUSES).order_by('-end_date')
        return get_objects_for_user(user, 'moderator_manage', klass=query_set)
    except (User.DoesNotExist, ) as e:
        raise ObjectNotFound from e


def find_by_id_for_moderator(audit_cycle_id, user_id):
    try:
        user = find_moderator_by_user_id(user_id)
        audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id, status__in=AuditCycle.MODERATOR_VISIBLE_STATUSES)

        if user.has_perm('moderator_manage', audit_cycle):
            return audit_cycle
        else:
            raise ObjectNotFound
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e


def find_by_id(audit_cycle_id):
    try:
        return AuditCycle.objects.get(pk=audit_cycle_id)
    except AuditCycle.DoesNotExist as e:
        raise ObjectNotFound from e

def find_by_auditcycle_id_for_client(audit_cycle_id, client=None):
    try:
        if client:
            # Assuming AuditCycle model has a ForeignKey to Client
            audit_cycle = AuditCycle.objects.get(id=audit_cycle_id, client=client)
        else:
            audit_cycle = AuditCycle.objects.get(pk=audit_cycle_id)
        return audit_cycle
    except AuditCycle.DoesNotExist:
        return None

def get_audit_cycle_by_id(audit_cycle_id):
    try:
        audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
        return audit_cycle
    except AuditCycle.DoesNotExist:
        return None
        
def set_post_approval_description(audit_cycle_id, post_approval_description):
    audit_cycle = find_by_id(audit_cycle_id)

    audit_cycle.post_approval_description = post_approval_description
    return save(audit_cycle)
def set_eligibility_for_auditor(audit_cycle_id,eligibility):
    audit_cycle = find_by_id(audit_cycle_id)

    audit_cycle.eligibility = eligibility
    return save(audit_cycle)

def set_checkpoints(audit_cycle_id, checkpoints):
    if AuditCycle.objects.filter(id=audit_cycle_id, status__in=[AuditCycle.CLEARING, AuditCycle.ARCHIVED]).exists():
        raise AppLogicError("Checkpoints cannot be edited")
    elif AuditStore.objects.\
            filter(audit__audit_cycle__id=audit_cycle_id, status__in=[AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED, AuditStore.SUBMITTED, AuditStore.PM_REVIEW, AuditStore.COMPLETED, AuditStore.ACCEPTED])\
            .exists():
        raise AppLogicError("Checkpoints cannot be edited")
    elif ";" not in checkpoints:
        raise AppLogicError("Please enter semicolon (;) in checkpoints")
    else:
        audit_cycle = find_by_id(audit_cycle_id)
        audit_cycle.check_points = checkpoints
        return save(audit_cycle)

def set_charge_per_audit(audit_cycle_id, charge_per_audit):
    audit_cycle = find_by_id(audit_cycle_id)

    audit_cycle.charge_per_audit = charge_per_audit
    return save(audit_cycle)

def set_system_cost(audit_cycle_id, system_cost):
    audit_cycle = find_by_id(audit_cycle_id)

    audit_cycle.system_cost = system_cost
    return save(audit_cycle)

def get_audit_alignment_factor_by_audit_cycle(audit_cycle_id):
    audit_cycle = find_by_id(audit_cycle_id)
    if audit_cycle is None:
        raise AppLogicError("Audit cycle not found")

    alignment_factors = {}
    for factor in audit_cycle.audit_alignment_factors:
        alignment_factors[factor['key']] = factor['value']
    return alignment_factors

def set_audit_alignment_factor_by_audit_cycle(audit_cycle_id: int, factors: dict) -> AuditCycle:
    audit_cycle = find_by_id(audit_cycle_id)
    is_valid_date_availability = False
    if factors.get('date_availability',''):
        is_valid_date_availability = validate_date_range_from_string(factors.get('date_availability',''))
        if not is_valid_date_availability:
            raise AppLogicError("Please enter valid dates")

    audit_cycle.audit_alignment_factors = [
        {
            'key': 'gender',
            'value': factors.get('gender',[]),
            'type': 'str'
        },
        {
            'key': 'income',
            'value': factors.get('income',[]),
            'type': 'str'
        },
        {
            'key': 'education',
            'value': factors.get('education',[]),
            'type': 'str'
        },
        {
            'key': 'car_cost',
            'value': factors.get('car_cost',[]),
            'type': 'str'
        },
        {
            'key': 'occupation',
            'value': factors.get('occupation',[]),
            'type': 'str'
        },
        {
            'key': 'interest_area',
            'value': factors.get('interest_area',[]),
            'type': 'str'
        },
        {
            'key': 'marital_status',
            'value': factors.get('marital_status',[]),
            'type': 'str'
        },
        {
            'key': 'auditor_rating',
            'value': factors.get('auditor_rating',[]),
            'type': 'func'
        },
        {
            'key': 'report_rating',
            'value': factors.get('report_rating',[]),
            'type': 'func'
        },
        {
            'key': 'date_availability',
            'value': factors.get('date_availability','') if is_valid_date_availability else '',
            'type': 'func'
        },
        {
            'key': 'auditor_age_range',
            'value': factors.get('auditor_age_range', ''),
            'type': 'func'
        },
    ]
    # selected_options = []
    # for factor in audit_cycle.audit_alignment_factors:
    #     if factor['value']:
    #         selected_options.extend(["{}:{}".format(factor['key'], factor['value'])])
    # eligibility_value = ', '.join(selected_options)
    # audit_cycle.eligibility = eligibility_value
    return save(audit_cycle)

def find_audit_cycles_by_client(client_id):
    return AuditCycle.objects.filter(client_id=client_id).order_by('-end_date')

def copy_audit_details_from_to(from_audit_cycle_id, to_audit_cycle_id, checkpoints, post_approval_desc, proof_tags, audit_alignment_factors):
    if not from_audit_cycle_id:
        raise AppLogicError("Please Select Audit Cycle")

    from_audit_cycle = find_by_id(from_audit_cycle_id)
    to_audit_cycle = find_by_id(to_audit_cycle_id)

    if audit_alignment_factors:
        to_audit_cycle.audit_alignment_factors = from_audit_cycle.audit_alignment_factors
    if checkpoints:
        to_audit_cycle.check_points = from_audit_cycle.check_points
    if post_approval_desc:
        to_audit_cycle.post_approval_description = from_audit_cycle.post_approval_description
    if proof_tags:
        audit_cycle_proof_tag.copy_proof_tag_from_to_audit_cycle(from_audit_cycle, to_audit_cycle)

    to_audit_cycle.save()
    return to_audit_cycle


def find_audit_cycles_by_manager(manager_id):
    return AuditCycle.objects.filter(client__managers__user__id=manager_id).order_by('-end_date')

def filter_audit_cycle_by_manager(manager_id, month, year):
    return AuditCycle.objects.filter(start_date__month=month, start_date__year=year, client__managers__user__id=manager_id).order_by('-end_date')

def find_by_quotation_id(quotation_id: int) -> AuditCycle:
    try:
        audit_cycle = AuditCycle.objects.get(quotation_id = quotation_id)
    except AuditCycle.DoesNotExist as e:
        raise AppLogicError("Audit cycle not found")
    return audit_cycle

def eligibility_wise_auditor(audit_cycle_id, store_id):
    audit_cycle = audit_cycle_service.get_audit_cycle_by_id(audit_cycle_id)
    if not audit_cycle:
        return {"error": "Audit cycle not found."}

    factors = audit_cycle.audit_alignment_factors or []
    skip_keys = {"auditor_rating", "report_rating", "date_availability", "auditor_age_range"}
    factors_with_value = [f for f in factors if f.get("value") and f.get("key") not in skip_keys]

    if not factors_with_value:
        return {"error": "No matching factors found."}

    try:
        store = Store.objects.get(id=store_id)
        city = City.objects.get(pk=store.city_id)
        country_code = city.country
        lat1, lon1 = city.lat, city.lon
        if store.pincode:
            loc = geo.get_lat_lon_from_pincode(store.pincode, country_code)
            if loc:
                lat1, lon1 = loc["lat"], loc["lon"]
    except Store.DoesNotExist:
        return {"error": "Store not found."}

    auditors_qs = (ProfileInfo.objects.filter(city_id=store.city_id,user__is_active=True).select_related("user").prefetch_related("user__additionalinfo"))
    pincode_cache = {}
    eligible_auditors = []

    for profile in auditors_qs.iterator():
        additional = getattr(profile.user, "additionalinfo", None)
        total_factors = len(factors_with_value)
        matched_factors = 0
        matched_list = []
        unmatched_list = []

        for factor in factors_with_value:
            key = factor.get("key")
            expected_value = factor.get("value")

            actual_value = getattr(profile, key, None)
            if actual_value is None and additional:
                actual_value = getattr(additional, key, None)

            expected_list = expected_value if isinstance(expected_value, list) else [expected_value]
            expected_list = [str(v).strip().lower() for v in expected_list]
            actual_str = str(actual_value).strip().lower() if actual_value is not None else None

            if actual_str in expected_list:
                matched_factors += 1
                matched_list.append({"key": key,"expected": expected_value,"actual": actual_value})
            else:
                unmatched_list.append({"key": key,"expected": expected_value,"actual": actual_value})

        if total_factors == 0:
            continue

        match_percentage = round((matched_factors / total_factors) * 100, 2)
        if match_percentage == 0:
            continue

        aud_lat = aud_lon = None
        if profile.pincode:
            if profile.pincode in pincode_cache:
                loc = pincode_cache[profile.pincode]
            else:
                loc = geo.get_lat_lon_from_pincode(profile.pincode, country_code)
                pincode_cache[profile.pincode] = loc
            if loc:
                aud_lat, aud_lon = loc["lat"], loc["lon"]

        if not aud_lat or not aud_lon:
            aud_lat, aud_lon = lat1, lon1

        distance = geo.get_distance_from_lat1_lon1_and_lat2_lon2(lat1, lon1, aud_lat, aud_lon)

        eligible_auditors.append({
            "auditor_id": profile.id,
            "user_id": profile.user.id,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "mobile_number": profile.mobile_number,
            "email": profile.user.email,
            "match_percentage": match_percentage,
            "distance_km": round(distance, 2),
            "last_login": profile.user.last_login,
            "matched_factors": matched_list,
            "unmatched_factors": unmatched_list,
        })

    # eligible_auditors.sort(key=lambda x: (-x["match_percentage"], x["distance_km"]))
    eligible_auditors = sorted(eligible_auditors,key=lambda x: (-x["match_percentage"], x["last_login"] or "", x["distance_km"]))[:20]
    # eligible_auditors.sort(key=lambda x: (-x["match_percentage"], x["last_login"] or "", x["distance_km"]))

    return {
        "audit_cycle_id": audit_cycle.id,
        "store_id": store.id,
        "eligible_auditors_count": len(eligible_auditors),
        "eligible_auditors": eligible_auditors[:20],
    }

def distance_wise_auditor(store_id):
    try:
        store = Store.objects.get(id=store_id)
    except Store.DoesNotExist:
        return {"detail": "Store not found."}

    city_id = store.city_id
    pincode = store.pincode
    city = City.objects.get(pk=city_id)
    country_code = city.country

    lat1, lon1 = city.lat, city.lon
    if pincode:
        loc = geo.get_lat_lon_from_pincode(pincode, country_code)
        if loc:
            lat1, lon1 = loc['lat'], loc['lon']

    auditors_qs = ProfileInfo.objects.filter(city_id=city_id,user__is_active=True).select_related('user').prefetch_related(
        Prefetch('user__additionalinfo', queryset=AdditionalInfo.objects.all())
    )
    auditor_distances = []

    for profile in auditors_qs.iterator():
        aud_lat, aud_lon = None, None
        if profile.pincode:
            loc = geo.get_lat_lon_from_pincode(profile.pincode, country_code)
            if loc:
                aud_lat, aud_lon = loc['lat'], loc['lon']

        if aud_lat is None or aud_lon is None:
            aud_lat, aud_lon = lat1, lon1
        distance = geo.get_distance_from_lat1_lon1_and_lat2_lon2(lat1, lon1, aud_lat, aud_lon)

        auditor_distances.append({
            "auditor_id": profile.id,
            "user_id": profile.user.id,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "mobile_number": profile.mobile_number,
            "email": profile.user.email,
            "distance_km": round(distance, 2),
            "last_login": profile.user.last_login,
        })
    nearest_auditors = sorted(auditor_distances, key=lambda x: x["distance_km"])[:20]

    return {
        "store_id": store.id,
        "city_id": city_id,
        "pincode": pincode,
        "nearest_auditors_count": len(nearest_auditors),
        "nearest_auditors": nearest_auditors
    }