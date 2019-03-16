from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

from guardian.models import UserObjectPermission

from audit_store.models import AuditStore
from audit.service import audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service

def moderator_summary_for_audit_cycle(audit_cycle_id):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    reports = audit_store_service.find_by_audit_cycle(audit_cycle.id).values("id", "status")
    report_ids = [str(report["id"]) for report in reports]

    content_type = ContentType.objects.get_for_model(AuditStore)
    permission = Permission.objects.get(content_type=content_type, codename="moderator_manage")

    perms = UserObjectPermission.objects.filter(content_type=content_type, object_pk__in=report_ids, permission=permission, user__is_active=True)

    data = {}

    for r in reports:
        for p in perms:
            if str(r["id"]) == p.object_pk:
                if p.user_id not in data:
                    data[p.user_id] = {}
                data[p.user_id][r["status"]] = data[p.user_id].get(r["status"], 0) + 1
    return data

def moderator_summary_global():
    reports = AuditStore.objects.filter(status__in=(
        AuditStore.ASSIGNED,
        AuditStore.ACKNOWLEDGED,
        AuditStore.SUBMITTED,
        AuditStore.PM_REVIEW,
        AuditStore.COMPLETED,
    )).values("id", "status")
    report_ids = [str(report["id"]) for report in reports]

    content_type = ContentType.objects.get_for_model(AuditStore)
    permission = Permission.objects.get(content_type=content_type, codename="moderator_manage")

    perms = UserObjectPermission.objects.filter(content_type=content_type, object_pk__in=report_ids, permission=permission, user__is_active=True)

    data = {}

    for r in reports:
        for p in perms:
            if str(r["id"]) == p.object_pk:
                if p.user_id not in data:
                    data[p.user_id] = {}
                data[p.user_id][r["status"]] = data[p.user_id].get(r["status"], 0) + 1
    return data
