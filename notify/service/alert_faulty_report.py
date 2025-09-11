import logging
from imagehash import hex_to_hash

from django.db.models import Q
from attachment.models import Attachment
from django.contrib.contenttypes.models import ContentType
from answer.models import ReportSection
from audit_store.models import AuditStore
from datetime import date
from kronos.celery import app

_logger = logging.getLogger(__name__)


def find_content_id_by_object_name(app_label,model):
    content_obj = ContentType.objects.get(app_label=app_label, model=model)
    return content_obj.id

# @app.task(ignore_result=True)
# def find_faulty_report():
#     attachment_obj = Attachment.objects.filter(completed_at__date=date.today(), proof_type="PHOTO", status="ATTACHED")
#     for att in attachment_obj:
#         if not att.attachment_id and att.image_hash:
#             img_hash = hex_to_hash(att.image_hash)
#             app_label, model = att.content_type.app_label, att.content_type.model
#             object_id = att.object_id
#             if app_label == "answer" and model == "reportsection":
#                 report_section_obj = ReportSection.objects.get(id=object_id)
#                 audit_store_id = report_section_obj.audit_store_id
#                 store_id = report_section_obj.audit_store.audit.store_id
#                 audit_store_obj = AuditStore.objects.filter(audit__store_id=store_id)
#                 audit_store_content_type_id = find_content_id_by_object_name("audit_store", "auditstore")
#                 for j in audit_store_obj:
#                     if not audit_store_id == j.id:
#                         report_section_content_type_id = find_content_id_by_object_name("answer", "reportsection")
#                         report_section_list = ReportSection.objects.filter(audit_store_id=j.id).values_list('id')
#                         # print("report_section_list",report_section_list)
#                         attachment_compare_obj = Attachment.objects.filter(
#                             Q(content_type_id=audit_store_content_type_id, object_id=j.id, mime_type__contains="image",
#                               status="ATTACHED") | Q(content_type_id=report_section_content_type_id,
#                                                      object_id__in=report_section_list, mime_type__contains="image",
#                                                      status="ATTACHED"))
#                         for att_cmp in attachment_compare_obj:
#                             if not att_cmp.id == att.id and att_cmp.image_hash:
#                                 img_hash_compare = hex_to_hash(att_cmp.image_hash)
#                                 if img_hash == img_hash_compare:
#                                     att.attachment_id = att_cmp.id
#                                     att.save()
#                                     att_cmp.attachment_id = att.id
#                                     att_cmp.save()
#                                     _logger.info("Repeated Attachment Found Attachment ID : %s", att.id)
#                                 else:
#                                     if not att.id:
#                                         if (img_hash - img_hash_compare) < 11:
#                                             att.attachment_id = att_cmp.id
#                                             att.save()
#                                             att_cmp.attachment_id = att.id
#                                             att_cmp.save()
#                                             _logger.info("Repeated Attachment Found Attachment ID : %s", att.id)
#             elif app_label == "audit_store" and model == "auditstore":
#                 audit_store = AuditStore.objects.get(id=object_id)
#                 audit_store_id = audit_store.id
#                 store_id = audit_store.audit.store_id
#                 audit_store_obj = AuditStore.objects.filter(audit__store_id=store_id)
#                 audit_store_content_type_id = find_content_id_by_object_name("audit_store", "auditstore")
#                 report_section_content_type_id = find_content_id_by_object_name("answer", "reportsection")
#                 for j in audit_store_obj:
#                     if not audit_store_id == j.id:
#                         report_section_list = ReportSection.objects.filter(audit_store_id=j.id).values_list('id')
#                         # print("report_section_list",report_section_list)
#                         attachment_compare_obj = Attachment.objects.filter(
#                             Q(content_type_id=audit_store_content_type_id, object_id=j.id, mime_type__contains="image",
#                               status="ATTACHED") | Q(content_type_id=report_section_content_type_id,
#                                                      object_id__in=report_section_list, mime_type__contains="image",
#                                                      status="ATTACHED"))
#                         for att_cmp in attachment_compare_obj:
#                             if not att_cmp.id == att.id and att_cmp.image_hash:
#                                 img_hash_compare = hex_to_hash(att_cmp.image_hash)
#                                 if img_hash == img_hash_compare:
#                                     att.attachment_id = att_cmp.id
#                                     att.save()
#                                     att_cmp.attachment_id = att.id
#                                     att_cmp.save()
#                                     _logger.info("Repeated Attachment Found Attachment ID : %s", att.id)
#                                 else:
#                                     if not att.id:
#                                         if (img_hash - img_hash_compare) < 11:
#                                             att.attachment_id = att_cmp.id
#                                             att.save()
#                                             att_cmp.attachment_id = att.id
#                                             att_cmp.save()
#                                             _logger.info("Repeated Attachment Found Attachment ID : %s", att.id)
#     return True

# from notify.service.alert_faulty_report import find_faulty_report
# import logging
# from imagehash import hex_to_hash

# from django.db.models import Q 
# from attachment.models import Attachment
# from django.contrib.contenttypes.models import ContentType
# from answer.models import ReportSection
# from audit_store.models import AuditStore
# from datetime import date
# from kronos.celery import app
# find_faulty_report()

@app.task(ignore_result=True)
def find_faulty_report():
    attachment_obj = Attachment.objects.filter(completed_at__date=date.today(),proof_type="PHOTO",status="ATTACHED").exclude(image_hash__isnull=True).exclude(image_hash="")

    audit_store_content_type_id = find_content_id_by_object_name("audit_store", "auditstore")
    report_section_content_type_id = find_content_id_by_object_name("answer", "reportsection")

    for att in attachment_obj.iterator():  # iterator() avoids loading all objects in memory
        if att.attachment_id:
            continue  # Skip if already linked

        img_hash = hex_to_hash(att.image_hash)
        app_label, model = att.content_type.app_label, att.content_type.model
        object_id = att.object_id

        if app_label == "answer" and model == "reportsection":
            report_section_obj = ReportSection.objects.select_related('audit_store__audit').only(
                'audit_store_id', 'audit_store__user_id', 'audit_store__audit__store_id').get(id=object_id)

            auditor_id = report_section_obj.audit_store.user_id
            store_id = report_section_obj.audit_store.audit.store_id
            audit_store_id = report_section_obj.audit_store_id

        elif app_label == "audit_store" and model == "auditstore":
            audit_store_obj_single = AuditStore.objects.select_related('audit').only(
                'user_id', 'audit__store_id').get(id=object_id)

            auditor_id = audit_store_obj_single.user_id
            store_id = audit_store_obj_single.audit.store_id
            audit_store_id = audit_store_obj_single.id
        else:
            continue

        # Step 1: Get last 6 distinct audit_cycle_ids for this auditor + store (order preserved)
        last_cycles_qs = AuditStore.objects.filter(audit__store_id=store_id, user_id=auditor_id
                ).order_by('-audit__audit_cycle_id').values_list('audit__audit_cycle_id', flat=True)

        seen = set()
        last_cycles = []
        for c in last_cycles_qs:
            if c not in seen:
                seen.add(c)
                last_cycles.append(c)
            if len(last_cycles) >= 6:
                break

        if not last_cycles:
            continue

        # Step 2: Get all AuditStore IDs in these last 6 cycles
        last_audit_ids_qs = AuditStore.objects.filter(
            audit__store_id=store_id, user_id=auditor_id, audit__audit_cycle_id__in=last_cycles
        ).values_list('id', flat=True)
        

        # Step 3: Fetch all attachments under these audit stores and their report sections
        attachments_to_compare = Attachment.objects.filter(
            Q(content_type_id=audit_store_content_type_id, object_id__in=last_audit_ids_qs, mime_type__contains="image", status="ATTACHED") |
            Q(content_type_id=report_section_content_type_id,
              object_id__in=ReportSection.objects.filter(audit_store_id__in=last_audit_ids_qs).values_list('id', flat=True),
              mime_type__contains="image", status="ATTACHED")
        ).exclude(image_hash__isnull=True).exclude(image_hash="").only('id', 'image_hash', 'attachment_id')

        # Step 4: Compare hashes
        for att_cmp in attachments_to_compare.iterator():
            if att_cmp.id == att.id or att_cmp.attachment_id:
                continue

            distance = img_hash - hex_to_hash(att_cmp.image_hash)
            if distance == 0 or distance < 11:
                att.attachment_id = att_cmp.id
                att_cmp.attachment_id = att.id
                att.save(update_fields=['attachment_id'])
                att_cmp.save(update_fields=['attachment_id'])
                _logger.info("Repeated Attachment Found: %s linked with %s", att.id, att_cmp.id)
                break  # Only link first duplicate

    return True