
from kronos.exceptions import AppLogicError
from registration.models import GROUP_NAME_CLIENT
from manager.models import MPSolution,MPOrder
from django.contrib.auth.models import User
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
    

def add_order(data):
    sum=0
    for i in data.get('store'):
        sum+=i['count']
    if sum!=data.get('no_of_response'):
        raise AppLogicError("No of Response and All Store Count is not Equal")
    user=User.objects.get(id=int(data.get('user')))
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
    for i in data['store']:
        store.append(i)
    order.store=store
    order.save()
    order = alignment_factor(order.id,data.get('alignment_factors'))
    return order