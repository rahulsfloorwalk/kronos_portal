from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.db.models import Q
from client.service import store as store_service

from kronos.exceptions import ObjectNotFound, AppLogicError

from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from client.models import Store
from manager.models import City
import re
from manager.service import geo
from registration.service import auditor as auditor_service
from auditor.models import AuditApplication
from audit.service import audit_cycle as audit_cycle_service

def find_pincode_and_city_by_audit_cycle_id(audit_cycle_id):
    audit_list = Audit.objects.filter(audit_cycle_id=audit_cycle_id,hidden=False).prefetch_related('store')
    pincode_and_city = []
    for i in audit_list:
        pincode_and_city.append({'city':i.store.city,'pincode':i.get_pincode_audit()})
    return pincode_and_city
def find_audit_city_by_audit_cycle_id(audit_cycle_id):
    a=list(Audit.objects.filter(audit_cycle_id=audit_cycle_id,hidden=False).prefetch_related('store',
        'store__client',
        'store__city',
        'audit_stores',
        'audit_stores__user',
        'audit_stores__user__profileinfo',
        'applications',
        'applications__profileinfo',
        'applications__profileinfo__user',
        'audit_cycle__questionnaire_type',
        'audit_cycle__audits',))
    city_list=[]    
    for i in a:
        if i.store.city not in city_list:
            city_list.append(i.store.city)
    return city_list

def find_rem_store_by_audit_cycle_id(audit_cycle_id):
    audit=AuditCycle.objects.get(pk=audit_cycle_id)
    audit_store_list = Audit.objects.filter(audit_cycle = audit_cycle_id).values_list('store', flat=True)
    return Store.objects.filter(client_id=audit.client_id).order_by('city__name').select_related('client','city').exclude(id__in = audit_store_list)

def create_audit_by_multiple_store(data):
    if not data.get('addStore'):
        raise AppLogicError("Please Choose at least One Store")
    audit_cycle_id = data.get('audit_cycle', '')
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    store_exists = Store.objects.filter(client = audit_cycle.client.id).exists()
    if not store_exists:
        raise AppLogicError("Stores are not found in This Client")

    audit_store_list = Audit.objects.filter(audit_cycle = audit_cycle_id,store_id__in=data['addStore']).values_list('store', flat=True)
    client_store_list = Store.objects.filter(client = audit_cycle.client,id__in=data['addStore']).exclude(id__in = audit_store_list)
    if not client_store_list:
        raise AppLogicError("Audits are already created for this stores")

    audit_list = []
    for store in client_store_list:
        audit = {
            'count': data.get('count', 1),
            'earnings_per_audit': data.get('earnings_per_audit',audit_cycle.earnings_per_audit),
            'reimbursement': data.get('reimbursement',audit_cycle.reimbursement),
            'store': store,
            'audit_cycle': audit_cycle,
            'post_approval_description': data.get('post_approval_description','')
        }
        audit_list.append(Audit(**audit))
    audits = Audit.objects.bulk_create(audit_list)
    return audits

def find_audit_by_id(audit_id):
    try:
        return Audit.objects.get(pk=audit_id)
    except Audit.DoesNotExist as e:
        raise ObjectNotFound from e

def find_audits_by_audit_cycle_id(audit_cycle_id):
    return Audit.objects.filter(audit_cycle_id=audit_cycle_id).prefetch_related(
        'store',
        'store__client',
        'store__city',
        'audit_stores',
        'audit_stores__user',
        'audit_stores__user__profileinfo',
        'applications',
        'applications__profileinfo',
        'applications__profileinfo__user',
        'audit_cycle__questionnaire_type',
        'audit_cycle__audits',
    )

def mp_find_audits_by_audit_cycle_id(audit_cycle_id):
    return Audit.objects.filter(audit_cycle_id=audit_cycle_id).prefetch_related(
        'store',
        'store__client',
        'store__city',
        'audit_stores',
        'applications',
        'audit_cycle__questionnaire_type',
        'audit_cycle__audits',
    )

def save(audit):
    try:
        audit.save()
        return audit
    except IntegrityError as e:
        raise AppLogicError("store is already added to this audit cycle") from e


def hide_audit(audit_id):
    audit = find_audit_by_id(audit_id)
    audit.hidden = True
    audit.save()
    return audit


def unhide_audit(audit_id):
    audit = find_audit_by_id(audit_id)
    audit.hidden = False
    audit.save()
    return audit


def delete(audit_id):
    try:
        audit = find_audit_by_id(audit_id)
        audit.delete()
    except IntegrityError as e:
        raise AppLogicError("audit cannot be delete now") from e

def find_audits_around_pincode_and_city(city_id:int,kms:int,pincode:int):

    city = City.objects.get(pk=city_id)
    country_code = city.country

    if pincode is not None:
        lat1=geo.get_lat_lon_from_pincode(pincode,country_code).get('lat')
        lon1=geo.get_lat_lon_from_pincode(pincode,country_code).get('lon')
    else:
        lat1=city.lat
        lon1=city.lon
    
    active_audits = Audit.objects.filter(
        count__gt = 0,
        hidden = False,
        audit_cycle__status__in=[
            AuditCycle.UPCOMING,
            AuditCycle.ACTIVE
        ]
    )
    # get the bounding box
    lon_max, lon_min, lat_max, lat_min = geo.bounding_box(lat1, lon1, kms)

    available_audits = active_audits.filter(
        # Q(audit_cycle__type__in=[AuditCycle.WEB, AuditCycle.PHONE]) |
        Q(audit_cycle__type=AuditCycle.GENERAL) |
        Q(
            store__city__lat__lte=lat_max,
            store__city__lat__gte=lat_min,
            store__city__lon__lte=lon_max,
            store__city__lon__gte=lon_min
        )
    )
    available_audit_list = []
    nearDis=[]
    for i in available_audits:
        if i.store.pincode:
            if geo.get_lat_lon_from_pincode(i.store.pincode,country_code):
                lat2=geo.get_lat_lon_from_pincode(i.store.pincode,country_code).get('lat')
                lon2=geo.get_lat_lon_from_pincode(i.store.pincode,country_code).get('lon')
        elif i.store.address and re.findall("\d{6}", i.store.address):
            if geo.get_lat_lon_from_pincode(pincode,country_code).get('lat') and geo.get_lat_lon_from_pincode(pincode,country_code).get('lon'):
                lat2=geo.get_lat_lon_from_pincode(pincode,country_code).get('lat')
                lon2=geo.get_lat_lon_from_pincode(pincode,country_code).get('lon')
        elif i.store.city_id:
            city = City.objects.get(pk=i.store.city_id)
            if city:
                lat2 = city.lat
                lon2 = city.lon
        distance=geo.get_distance_from_lat1_lon1_and_lat2_lon2(lat1,lon1,lat2,lon2)
        nearDis.append({'distance':distance,'id':i.id})
    sorted_data = sorted(nearDis, key=lambda x: x["distance"])
    # nearest_three = sorted_data[:5]
    nearest_three = sorted_data 
    for i in nearest_three:
        audit_count = Audit.objects.get(id=i.get('id')).count
        if audit_count > 1:
            if not AuditStore.objects \
                    .filter(audit__id=i.get('id'), status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED]) \
                    .count() == audit_count:
                available_audit_list.append(i.get('id'))
        else:
            if AuditStore.objects.filter(audit__id=i.get('id')).exists():
                if not AuditStore.objects.filter(audit__id=i.get('id'), status__in=[AuditStore.COMPLETED,
                                                                             AuditStore.ACCEPTED]) \
                        .exists():
                    available_audit_list.append(i.get('id'))
            else:
                available_audit_list.append(i.get('id'))
    available_audits = Audit.objects.filter(id__in=available_audit_list)
    return available_audits  

        

def find_audits_around_city(city_id:int, kms:int=None):

    if kms not in [1,5,10,20,50,100]:
        kms=50  # default distance to search for

    try:
        city = City.objects.get(pk=city_id)
    except City.DoesNotExist as e:
        raise ObjectNotFound from e

    active_audits = Audit.objects.filter(
        count__gt = 0,
        hidden = False,
        audit_cycle__status__in=[
            AuditCycle.UPCOMING,
            AuditCycle.ACTIVE
        ]
    )

    # get the bounding box
    lon_max, lon_min, lat_max, lat_min = geo.bounding_box(city.lat, city.lon, kms)

    available_audits = active_audits.filter(
        # Q(audit_cycle__type__in=[AuditCycle.WEB, AuditCycle.PHONE]) |
        Q(audit_cycle__type=AuditCycle.GENERAL) |
        Q(
            store__city__lat__lte=lat_max,
            store__city__lat__gte=lat_min,
            store__city__lon__lte=lon_max,
            store__city__lon__gte=lon_min
        )
    )
    available_audit_list = []
    for i in available_audits:
        audit_count = Audit.objects.get(id=i.id).count
        if audit_count > 1:
            if not AuditStore.objects \
                    .filter(audit__id=i.id, status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED]) \
                    .count() == audit_count:
                available_audit_list.append(i.id)
        else:
            if AuditStore.objects.filter(audit__id=i.id).exists():
                if not AuditStore.objects.filter(audit__id=i.id, status__in=[AuditStore.COMPLETED,
                                                                             AuditStore.ACCEPTED]) \
                        .exists():
                    available_audit_list.append(i.id)
            else:
                available_audit_list.append(i.id)
    available_audits = Audit.objects.filter(id__in=available_audit_list)
    return available_audits


def find_applied_audits_by_auditor_id(user_id,is_load_more, last_total_count):
    auditor = auditor_service.find_auditor_by_id(user_id)
    applied_audits = AuditApplication.objects.filter(
        profileinfo_id=auditor.profileinfo.id,
        status__in=(AuditApplication.APPLIED,AuditApplication.REJECTED,AuditApplication.WAITLISTED,AuditApplication.WAITLISTED,AuditApplication.APPROVED),
        audit__audit_cycle__status=AuditCycle.ACTIVE)
    total_count = applied_audits.count()
    if is_load_more:
        start = int(last_total_count)
        end = int(last_total_count) + 20
        applied_audits_obj_slice = applied_audits[start:end]
    else:
        applied_audits_obj_slice = applied_audits[0:20]
    
    return applied_audits_obj_slice,total_count

def find_audits_for_auditor_limit(user_id,kms):
    auditor = auditor_service.find_auditor_by_id(user_id)
    if not auditor.profileinfo.is_complete():
        raise AppLogicError("please complete your personal information to view audits")

    if kms and int(kms) in [1,5,10,20,50,100]:
        pass
    elif kms is None and hasattr(auditor, 'additionalinfo') and auditor.additionalinfo.distance:
        kms = auditor.additionalinfo.distance
    else:
        kms = 50

    return find_audits_around_pincode_and_city(auditor.profileinfo.city_id, int(kms),auditor.profileinfo.pincode)
    
def find_audits_for_auditor(user_id, kms):
    auditor = auditor_service.find_auditor_by_id(user_id)
    if not auditor.profileinfo.is_complete():
        raise AppLogicError("please complete your personal information to view audits")

    if kms and int(kms) in [1,5,10,20,50,100]:
        pass
    elif kms is None and hasattr(auditor, 'additionalinfo') and auditor.additionalinfo.distance:
        kms = auditor.additionalinfo.distance
    else:
        kms = 50

    return find_audits_around_city(auditor.profileinfo.city_id, int(kms))


def find_audits_by_city(user_id, city_id, kms):
    auditor = auditor_service.find_auditor_by_id(user_id)

    if not auditor.profileinfo.is_complete():
        raise AppLogicError("please complete your personal information to view audits")

    if kms and int(kms) in [1,5,10,20,50,100]:
        pass
    elif kms is None and hasattr(auditor, 'additionalinfo') and auditor.additionalinfo.distance:
        kms = auditor.additionalinfo.distance
    else:
        kms = 50

    return find_audits_around_city(city_id, int(kms))


@atomic
def copy_audits_from_to(from_audit_cycle_id, to_audit_cycle_id):
    try:
        from_audit_cycle = audit_cycle_service.find_by_id(from_audit_cycle_id)
        to_audit_cycle = audit_cycle_service.find_by_id(to_audit_cycle_id)

        for audit in from_audit_cycle.audits.all():
            new_audit = Audit()
            new_audit.audit_cycle = to_audit_cycle
            new_audit.store = audit.store
            new_audit.count = audit.count
            new_audit.earnings_per_audit = audit.earnings_per_audit
            new_audit.reimbursement = audit.reimbursement
            new_audit.post_approval_description = audit.post_approval_description
            new_audit.save()

        return to_audit_cycle.audits.all()
    except IntegrityError as e:
        raise AppLogicError("a store with audit already exists in this audit cycle")


def create_audit_by_state(data):
    state = data.get('state','')
    audit_cycle_id = data.get('audit_cycle', '')
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)

    store_exists = Store.objects.filter(client = audit_cycle.client.id, city__state= state).exists()
    if not store_exists:
        raise AppLogicError("Stores are not found for the state")

    audit_store_list = Audit.objects.filter(audit_cycle = audit_cycle_id, store__city__state= state).values_list('store', flat=True)

    client_store_list = Store.objects.filter(client = audit_cycle.client,city__state= state).exclude(id__in = audit_store_list)

    if not client_store_list:
        raise AppLogicError("Audits are already created for this state")

    audit_list = []
    for store in client_store_list:
        audit = {
            'count': data.get('count', 1),
            'earnings_per_audit': data.get('earnings_per_audit',audit_cycle.earnings_per_audit),
            'reimbursement': data.get('reimbursement',audit_cycle.reimbursement),
            'store': store,
            'audit_cycle': audit_cycle,
            'post_approval_description': data.get('post_approval_description','')
        }
        audit_list.append(Audit(**audit))
    audits = Audit.objects.bulk_create(audit_list)
    return audits

@atomic
def add_bulk_audit(client_id: int, audit_cycle_id: int, audit_data: list):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    if audit_cycle.client.id == client_id:
        for audit in audit_data:
            store = store_service.find_store_by_id(audit['store'])
            try:
                audit_obj = Audit()
                audit_obj.count = audit['count']
                audit_obj.store = store
                audit_obj.audit_cycle = audit_cycle
                audit_obj.client = audit_cycle.client
                audit_obj.save()
            except IntegrityError:
                raise AppLogicError("Audit is already created for {} store and {} cycle".format(store.name, audit_cycle.name))