
from kronos.exceptions import AppLogicError
from registration.models import GROUP_NAME_CLIENT
from manager.models import MPSolution
from client.models import MPOrder
from django.contrib.auth.models import User
from kronos.exceptions import ObjectNotFound
from attachment import service as attachment_service
from attachment.models import Attachment

def delete_order_file_by_attachment_id(attachment_id,order_id):
    attachment = attachment_service.find_by_id(attachment_id)
    if attachment.content_type.model_class() == MPOrder:
        order = attachment_service.get_order_for_attachment(attachment_id)
        if int(order.id) != int(order_id):
            raise ObjectNotFound
    else:
        raise AppLogicError("Invalid Attachment Content Type detected")

    return attachment_service.delete(attachment_id)

def find_attachment_id_by_order_id(order_id):
    order= find_order_by_id(order_id)
    attachment = Attachment.objects.get(orders__id=order.id,status=Attachment.ATTACHED)
    return attachment.id

def find_order_by_id(order_id):
    try:
        return MPOrder.objects.get(pk=order_id)
    except MPOrder.DoesNotExist as e:
        raise ObjectNotFound from e

def order_file_upload_by_order_id(order_id,file_name,file_size,mime_type):
    order = find_order_by_id(order_id)
    return attachment_service.upload_for_order(order_id,file_name,file_size,mime_type)

def find_order_detail_by_order_id(order_id):
    order= find_order_by_id(order_id)
    result=[]
    attachment = Attachment.objects.get(orders__id=order.id,status=Attachment.ATTACHED)
    if 'image' in attachment.mime_type:
        thumbnail_url = attachment.extra()["thumbnail_url"] 
        preview_url = attachment.extra()["preview_url"] 
        attachments_data={
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
        }
    else:
        direct_url= attachment.direct_url()
        attachments_data={
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
            "direct_url": direct_url
        }
    result.append({
        'id':order.id,
        'no_of_response':order.no_of_response,
        'solution':order.solution.id,
        'describe':order.describe,
        'user':order.user.id,
        'status':order.status,
        'alignment_factors':'',
        'store':'',
        'attachment':attachments_data
        
    })
    return result
    
def save(order):
    MPOrder.save(order)
    return order

def alignment_factor(order_id:int, factors:dict) -> MPOrder:
    order = MPOrder.objects.get(pk=order_id)
    order.alignment_factors=[
        {
            'key':'gender',
            'value': factors.get('gender',[]),
            'type':'str'
        },
        
        {
            'key': 'auditor_age_range',
            'value': factors.get('age_range', ''),
            'type': 'func'
        },
        {
            'key': 'income',
            'value': factors.get('income',[]),
            'type': 'str'
        },
        {
            'key': 'occupation',
            'value': factors.get('occupation',[]),
            'type': 'str'
        },
        {
            'key': 'car_cost',
            'value': factors.get('car_cost',[]),
            'type': 'str'
        },
        {
            'key': 'interest_area',
            'value': factors.get('interest_area',[]),
            'type': 'str'
        }
    ]
    return save(order)
    

def update_order(data,order):
    sum=0
    if data.get('store'):
        for i in data.get('store'):
            sum+=i['count']
        if sum!=data.get('no_of_response'):
            raise AppLogicError("No of Response and All Store Count is not Equal")
    if data.get('user'):
        user_id = int(data.get('user'))
        user = User.objects.get(id=user_id)
        order.user=user
    if data.get('solution'):
        solution= MPSolution.objects.get(id=data['solution'])
        if not solution:
            raise AppLogicError("Solution is Not Available")
        order.solution = solution
    if data.get('no_of_response'):
        order.no_of_response = data.get('no_of_response')
    if data.get('describe'):
        order.describe=data.get('describe')
    if data.get('status'):
        order.status=data.get('status')
    store=[]
    if data.get('store'):
        for i in data['store']:
            store.append(i)
        order.store=store
    order.save()
    if data.get('alignment_factors'):
        order = alignment_factor(order.id,data.get('alignment_factors'))
    return order

def add_order(data):
    sum=0

    if data.get('store'):
        for i in data.get('store'):
            sum+=i['count']
        if sum!=data.get('no_of_response'):
            raise AppLogicError("No of Response and All Store Count is not Equal")
    user_id = int(data.get('user')) 
    user=User.objects.get(id=user_id)

    solution= MPSolution.objects.get(id=data['solution'])
    if not solution:
        raise AppLogicError("Solution is Not Available")
    order= MPOrder()
    order.no_of_response=data.get('no_of_response')
    order.describe=data.get('describe')
    order.solution = solution
    order.status=data.get('status')
    order.user=user
    store=[]
    if data.get('store'):
        for i in data['store']:
            store.append(i)
        order.store=store
    order.save()
    if data.get('alignment_factors'):
        order = alignment_factor(order.id,data.get('alignment_factors'))
    return order