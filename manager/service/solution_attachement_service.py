from attachment.models import Attachment
from kronos.exceptions import AppLogicError ,ObjectNotFound
from manager.service import solution_service
from attachment import service as attachment_service
from manager.models import MPSolution,MPSolutionCategoryDetails,MPCategory
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

def find_solution_details_by_solution_id(solution_id):
    solution = MPSolution.objects.get(pk=solution_id)
    result=[]
    sol_cat=MPSolutionCategoryDetails.objects.filter(solution_id=solution_id).all()
    category_data=[]
    for i in sol_cat:
        category=MPCategory.objects.get(pk=i.category_id)
        category_data.append({
            'id':category.id,
            'name':category.name,
            'url_structure':category.url_structure,
            'overview':category.overview,
            'short_description':category.short_description
        })
    attachments = Attachment.objects.filter(solutions__id=solution.id,status=Attachment.ATTACHED).all()
    attachments_data=[]
    for attachment in attachments:
        thumbnail_url = attachment.extra()["thumbnail_url"]
        preview_url = attachment.extra()["preview_url"]
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
        })
    result.append({
        'id':solution.id,
        'name':solution.name,
        'url_structure':solution.url_structure,
        'price':solution.price,
        'tax':{
            'id':solution.tax.id,
            'name':solution.tax.name,
            'rate':solution.tax.rate
        },
        'overview':solution.overview,
        'how_it_work':solution.how_it_work,
        'execution_time':solution.execution_time,
        'short_description':solution.short_description,
        'is_active':solution.is_active,
        'attachments':attachments_data,
        'categories': category_data
    })
    return result
    