from ..models import MPCategory
from django.db.utils import IntegrityError
from kronos.exceptions import ObjectNotFound,AppLogicError

def find_all_categories():
    return MPCategory.objects.all()

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
