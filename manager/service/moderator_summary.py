from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

from guardian.models import UserObjectPermission

from audit_store.models import AuditStore
from audit.service import audit_cycle as audit_cycle_service
from audit_store import service as audit_store_service
from collections import defaultdict

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
    statuses = (
        AuditStore.ASSIGNED,
        AuditStore.ACKNOWLEDGED,
        AuditStore.SUBMITTED,
        AuditStore.PM_REVIEW,
        AuditStore.COMPLETED,
    )
    reports = AuditStore.objects.filter(status__in=statuses).values("id", "status")

    report_map = {str(r["id"]): r["status"] for r in reports}

    content_type = ContentType.objects.get_for_model(AuditStore)
    permission = Permission.objects.get(
        content_type=content_type,
        codename="moderator_manage"
    )

    perms = UserObjectPermission.objects.filter(
        content_type=content_type,
        permission=permission,
        object_pk__in=report_map.keys(),
        user__is_active=True
    ).values("user_id", "object_pk")

    # data = {}

    # for r in reports:
    #     for p in perms:
    #         if str(r["id"]) == p.object_pk:
    #             if p.user_id not in data:
    #                 data[p.user_id] = {}
    #             data[p.user_id][r["status"]] = data[p.user_id].get(r["status"], 0) + 1
    # return data

    moderator_ids = UserObjectPermission.objects.filter(
        content_type=content_type,
        permission=permission,
        user__is_active=True
    ).values_list("user_id", flat=True).distinct()

    data = {}
    for user_id in moderator_ids:
        data[user_id] = {status: 0 for status in statuses}

    for perm in perms:
        status = report_map.get(perm["object_pk"])
        if status:
            data[perm["user_id"]][status] += 1

    return data
