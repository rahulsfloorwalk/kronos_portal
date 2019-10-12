import logging
from imagehash import hex_to_hash

from django.db.models import Q
from attachment.models import Attachment
from django.contrib.contenttypes.models import ContentType
from answer.models import ReportSection
from audit_store.models import AuditStore
from datetime import date
_logger = logging.getLogger(__name__)

def find_content_id_by_object_name(app_label,model):
    content_obj = ContentType.objects.get(app_label=app_label, model=model)
    return content_obj.id

def find_faulty_report():
    attachment_obj = Attachment.objects.filter(completed_at__date=date.today(), mime_type__contains="image", status="ATTACHED")
    for att in attachment_obj:
        img_hash = hex_to_hash(att.image_hash)
        app_label, model = att.content_type.app_label, att.content_type.model
        object_id = att.object_id
        if app_label == "answer" and model == "reportsection":
            report_section_obj = ReportSection.objects.get(id=object_id)
            audit_store_id = report_section_obj.audit_store_id
            store_id = report_section_obj.audit_store.audit.store_id
            audit_store_obj = AuditStore.objects.filter(audit__store_id=store_id)
            audit_store_content_type_id = find_content_id_by_object_name("audit_store", "auditstore")
            for j in audit_store_obj:
                if not audit_store_id == j.id:
                    report_section_content_type_id = find_content_id_by_object_name("answer", "reportsection")
                    report_section_list = ReportSection.objects.filter(audit_store_id=j.id).values_list('id')
                    # print("report_section_list",report_section_list)
                    attachment_compare_obj = Attachment.objects.filter(
                        Q(content_type_id=audit_store_content_type_id, object_id=j.id, mime_type__contains="image",
                          status="ATTACHED") | Q(content_type_id=report_section_content_type_id,
                                                 object_id__in=report_section_list, mime_type__contains="image",
                                                 status="ATTACHED"))
                    for att_cmp in attachment_compare_obj:
                        if not att_cmp.id == att.id:
                            img_hash_compare = hex_to_hash(att_cmp.image_hash)
                            if img_hash == img_hash_compare:
                                att.attachment_id = att_cmp.id
                                att.save()
                                att_cmp.attachment_id = att.id
                                att_cmp.save()
                            else:
                                if not att.id:
                                    if (img_hash - img_hash_compare) < 11:
                                        att.attachment_id = att_cmp.id
                                        att.save()
                                        att_cmp.attachment_id = att.id
                                        att_cmp.save()
        elif app_label == "audit_store" and model == "auditstore":
            audit_store = AuditStore.objects.get(id=object_id)
            audit_store_id = audit_store.id
            store_id = audit_store.audit.store_id
            audit_store_obj = AuditStore.objects.filter(audit__store_id=store_id)
            audit_store_content_type_id = find_content_id_by_object_name("audit_store", "auditstore")
            report_section_content_type_id = find_content_id_by_object_name("answer", "reportsection")
            for j in audit_store_obj:
                if not audit_store_id == j.id:
                    report_section_list = ReportSection.objects.filter(audit_store_id=j.id).values_list('id')
                    # print("report_section_list",report_section_list)
                    attachment_compare_obj = Attachment.objects.filter(
                        Q(content_type_id=audit_store_content_type_id, object_id=j.id, mime_type__contains="image",
                          status="ATTACHED") | Q(content_type_id=report_section_content_type_id,
                                                 object_id__in=report_section_list, mime_type__contains="image",
                                                 status="ATTACHED"))
                    for att_cmp in attachment_compare_obj:
                        if not att_cmp.id == att.id:
                            img_hash_compare = hex_to_hash(att_cmp.image_hash)
                            if img_hash == img_hash_compare:
                                att.attachment_id = att_cmp.id
                                att.save()
                                att_cmp.attachment_id = att.id
                                att_cmp.save()
                            else:
                                if not att.id:
                                    if (img_hash - img_hash_compare) < 11:
                                        att.attachment_id = att_cmp.id
                                        att.save()
                                        att_cmp.attachment_id = att.id
                                        att_cmp.save()