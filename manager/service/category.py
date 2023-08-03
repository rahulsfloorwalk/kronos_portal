from ..models import MPCategory,MPSolution,MPSolutionCategoryDetails
from django.db.utils import IntegrityError
from kronos.exceptions import ObjectNotFound,AppLogicError
from attachment.models import Attachment
def find_solution_details_by_category_id(category_id):
    category = MPCategory.objects.get(pk=category_id)
    cat_solution = MPSolutionCategoryDetails.objects.filter(category=category_id).all()
    result=[]
    solution_data=[]
    for cat_sol in cat_solution:
        solution =MPSolution.objects.get(pk=cat_sol.solution_id)
        attachments_data=[]
        attachments=Attachment.objects.filter(solutions__id=solution.id,status=Attachment.ATTACHED).all()
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
        solution_data.append({
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
            'attachments':attachments_data  
        })
    result.append({
        "id": category.id,
        "name": category.name,
        "url_structure": category.url_structure,
        "overview": category.overview,
        "short_description": category.short_description,
        "solutions": solution_data
        })
    return result
    
def find_all_categories():
    return MPCategory.objects.all()

def find_all_public_categories():
    cats = MPCategory.objects.all()
    result = []
    for category in cats:
        attachments = Attachment.objects.filter(categories__id=category.id, status=Attachment.ATTACHED).all()
        attachments_data = []
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
            "id": category.id,
            "name": category.name,
            "url_structure": category.url_structure,
            "overview": category.overview,
            "short_description": category.short_description,
            "attachments": attachments_data,
        })
    return result
def save(category):
    category.save()
    return category
        
def find_category_by_id(category_id):
    try:
        return MPCategory.objects.get(pk=category_id)
    except MPCategory.DoesNotExist as e:
        raise ObjectNotFound from e
    
def delete(category_id):
    try:
        category = find_category_by_id(category_id)
        category.delete()
    except IntegrityError as e:
        raise AppLogicError("category cannot be delete now") from e
