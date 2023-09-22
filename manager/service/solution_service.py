from manager.models import MPSolution,MPSolutionCategoryDetails,MPCategory
from attachment.models import Attachment
from kronos.exceptions import ObjectNotFound
def find_by_id(solution_id):
    try:
        return MPSolution.objects.get(pk=solution_id)
    except MPSolution.DoesNotExist as e:
        raise ObjectNotFound from e

def get_popular_solutions():
    solutions = MPSolution.objects.filter(is_popular=True,is_show=True)
    solution_data=[]
    for i in solutions:
        cat_solution= MPSolutionCategoryDetails.objects.filter(solution=i).all()
        category_data=[]
        for cat_sol in cat_solution:
            cat = MPCategory.objects.get(pk=cat_sol.category_id)
            category_data.append({
                'id':cat.id,
                'name':cat.name,
                'url_structure':cat.url_structure,
                'overview':cat.overview,
                'short_description':cat.short_description
            })
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
                'is_popular':i.is_popular,
                'is_show':i.is_show,
                'attachments':attachments_data,
                'categories': category_data
           }
        )
    return solution_data

def get_solutions():
    solutions = MPSolution.objects.filter(is_active=True)
    solution_data=[]
    for i in solutions:
        cat_solution= MPSolutionCategoryDetails.objects.filter(solution=i).all()
        category_data=[]
        for cat_sol in cat_solution:
            cat = MPCategory.objects.get(pk=cat_sol.category_id)
            category_data.append({
                'id':cat.id,
                'name':cat.name,
                'url_structure':cat.url_structure,
                'overview':cat.overview,
                'short_description':cat.short_description
            })
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
                'is_show': i.is_show,
                'is_popular':i.is_popular,
                'attachments':attachments_data,
                'categories': category_data
           }
        )
    return solution_data

def get_solution_by_id(solution_id):
    solution = MPSolution.objects.get(pk=solution_id)
    cat_sol = MPSolutionCategoryDetails.objects.filter(solution_id=solution.id).all()
    category_data=[]
    for i in cat_sol:
        cat = MPCategory.objects.get(pk=i.category_id)
        category_data.append({
            'id':cat.id,
            'name':cat.name,
            'url_structure':cat.url_structure,
            'overview':cat.overview,
            'short_description':cat.short_description
        })
    solution_data={
        'id':solution.id,
        'name':solution.name,
        'url_structure':solution.url_structure,
        'price':solution.price,
        'audit_type':solution.audit_type,
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
        'is_show':solution.is_show,
        'is_popular':solution.is_popular,
        'categories':category_data
    }
    return solution_data