from ..models import MpInterestArea
from django.db.utils import IntegrityError
from kronos.exceptions import ObjectNotFound,AppLogicError

def find_all_interested_area():
    return MpInterestArea.objects.all()

def save(int_area):
    int_area.save()
    return int_area
        
def find_interested_area_by_id(interested_area_id):
    try:
        return MpInterestArea.objects.get(pk=interested_area_id)
    except MpInterestArea.DoesNotExist as e:
        raise ObjectNotFound from e
    
def delete(interested_area_id):
    try:
        interested_area = find_interested_area_by_id(interested_area_id)
        interested_area.delete()
    except IntegrityError as e:
        raise AppLogicError("interested area cannot be delete now") from e
