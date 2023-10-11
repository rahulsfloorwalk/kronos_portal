from attachment.models import Attachment
from kronos.exceptions import AppLogicError,ObjectNotFound
from attachment import service as attachment_service
from client.models import ClientRequirements

def find_attachment_by_clientrequiremnet_id(client_requirements_id):
    return attachment_service.find_by_clientrequirement(client_requirements_id)

def clientrequiremnet_image_upload_by_client_requirements_id(client_requirements_id,file_name,file_size,mime_type):
    clientrequirement = find_clintrequiremnent_by_id(client_requirements_id)
    return attachment_service.upload_for_clientrequiremnt(client_requirements_id,file_name,file_size,mime_type)


def delete_for_clientrequiremnet(attachment_id,client_requirements_id):
    attachment = attachment_service.find_by_id(attachment_id)
    
    if attachment.content_type.model_class() == ClientRequirements:
        client_requirements = attachment_service.get_clientrequirement_for_attachment(attachment_id)
        if int(client_requirements.id) != int(client_requirements_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")
    
    return attachment_service.delete(attachment_id)
    
def complete_for_clientrequiremnet(attachment_id,client_requirements_id):
    attachment = attachment_service.find_by_id(attachment_id)
    
    if attachment.content_type.model_class() == ClientRequirements:
        clientrequirement = attachment_service.get_clientrequirement_for_attachment(attachment_id)
        if int(clientrequirement.id) != int(client_requirements_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")
    return attachment_service.complete(attachment_id)

def find_clintrequiremnent_by_id(client_requirements_id):
    try:
        return ClientRequirements.objects.get(pk=client_requirements_id)
    except ClientRequirements.DoesNotExist as e:
        raise ObjectNotFound from e

def find_attachment_by_clintrequiremnent_id(client_requirements_id):
    return attachment_service.find_by_clientrequirement(client_requirements_id)