from attachment import service as attachment_service
from audit.models import AuditCycle
from kronos.exceptions import ObjectNotFound,AppLogicError
from audit.service import audit_cycle as audit_cycle_service

def find_attachment_by_audit_cycle_id(audit_cycle_id):
    return attachment_service.find_by_audit_cycle(audit_cycle_id)

def audit_cycle_image_upload_by_audit_cycle_id(audit_cycle_id,file_name,file_size,mime_type,attachment_category=None,link_url=None):
    audit_cycle = audit_cycle_service.find_by_id(audit_cycle_id)
    return attachment_service.upload_for_audit_cycle(audit_cycle_id,file_name,file_size,mime_type,attachment_category,link_url)

def delete_for_audit_cycle(attachment_id,audit_cycle_id):
    attachment = attachment_service.find_by_id(attachment_id)
    if attachment.content_type.model_class() == AuditCycle  :
        audit_cycle = attachment_service.get_audit_cycle_for_attachment(attachment_id)
        if int(audit_cycle.id) != int(audit_cycle_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")
    return attachment_service.delete(attachment_id) 
    
def complete_for_audit_cycle(attachment_id,audit_cycle_id):
    attachment = attachment_service.find_by_id(attachment_id)
    if attachment.content_type.model_class() == AuditCycle:
        audit_cycle = attachment_service.get_audit_cycle_for_attachment(attachment_id)
        if int(audit_cycle.id) != int(audit_cycle_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")
    return attachment_service.complete(attachment_id)