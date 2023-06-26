from ..models import MpIndustry
from django.db.utils import IntegrityError
from kronos.exceptions import ObjectNotFound,AppLogicError

def find_all_industries():
    return MpIndustry.objects.all()

def save(industry):
    industry.save()
    return industry
        
def find_industry_by_id(industry_id):
    try:
        return MpIndustry.objects.get(pk=industry_id)
    except MpIndustry.DoesNotExist as e:
        raise ObjectNotFound from e
    
def delete(industry_id):
    try:
        industry = find_industry_by_id(industry_id)
        industry.delete()
    except IntegrityError as e:
        raise AppLogicError("industry cannot be delete now") from e
