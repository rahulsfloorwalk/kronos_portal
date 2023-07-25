from ..models import MPCategory,MPSolution
from django.db.utils import IntegrityError
from kronos.exceptions import ObjectNotFound,AppLogicError
from ..service import category_attachement_service
from attachment.models import Attachment
def find_solution_details_by_category_id(category_id):
    category= MPCategory.objects.get(pk=category_id)
    result=[]
    solution_data=[]
    solutions=MPSolution.objects.filter(category_id=category_id).all()
    for i in solutions:
        attachments = Attachment.objects.filter(solutions__id=i.id,status=Attachment.ATTACHED).all()
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
        solution_data.append(
            {
                'id':i.id,
                'name':i.name,
                'url_structure':i.url_structure,
                'price':i.price,
                'category':{
                    'id':i.category.id,
                    'name':i.category.name,
                    'url_structure':i.category.url_structure,
                    'overview':i.category.overview,
                    'short_description':i.category.short_description
                },
                'tax':{
                    'id':i.tax.id,
                    'name':i.tax.name,
                    'rate':i.tax.rate
                },
                'overview':i.overview,
                'how_it_work':i.how_it_work,
                'execution_time':i.execution_time,
                'short_description':i.short_description,
                'is_active':i.is_active,
                'attachments':attachments_data
           }
        )
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
