from attachment.models import Attachment
from kronos.exceptions import AppLogicError ,ObjectNotFound
from manager.service import solution_service
from attachment import service as attachment_service
from manager.models import MPSolution
def find_attachment_by_solution_id(solution_id):
    return attachment_service.find_by_solution(solution_id)

def solution_image_upload_by_solution_id(solution_id,file_name,file_size,mime_type):
    solution = solution_service.find_by_id(solution_id)
    return attachment_service.upload_for_solution(solution_id,file_name,file_size,mime_type)

def delete_for_solution(attachment_id,solution_id):
    attachment = attachment_service.find_by_id(attachment_id)
    
    if attachment.content_type.model_class() == MPSolution:
        solution = attachment_service.get_solution_for_attachment(attachment_id)
        if int(solution.id) != int(solution_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")

    return attachment_service.delete(attachment_id)
    
def complete_for_solution(attachment_id,solution_id):
    attachment = attachment_service.find_by_id(attachment_id)
    
    if attachment.content_type.model_class() == MPSolution:
        solution = attachment_service.get_solution_for_attachment(attachment_id)
        if int(solution.id) != int(solution_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")
    return attachment_service.complete(attachment_id)