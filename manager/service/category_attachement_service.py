from attachment.models import Attachment
from kronos.exceptions import AppLogicError,ObjectNotFound
from attachment import service as attachment_service
from manager.models import MPCategory
from manager.service import category as category_service
def find_attachment_by_category_id(category_id):
    return attachment_service.find_by_category(category_id)
    
def category_image_upload_by_category_id(category_id,file_name,file_size,mime_type):
    category = category_service.find_category_by_id(category_id)
    return attachment_service.upload_for_category(category_id,file_name,file_size,mime_type)

def delete_for_category(attachment_id,category_id):
    attachment = attachment_service.find_by_id(attachment_id)
    if attachment.content_type.model_class() == MPCategory:
        category = attachment_service.get_category_for_attachment(attachment_id)
        if int(category.id) != int(category_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")

    return attachment_service.delete(attachment_id)

def complete_for_category(attachment_id,category_id):
    attachment = attachment_service.find_by_id(attachment_id)
    
    if attachment.content_type.model_class() == MPCategory:
        category = attachment_service.get_category_for_attachment(attachment_id)
        if int(category.id) != int(category_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")
    return attachment_service.complete(attachment_id)
    