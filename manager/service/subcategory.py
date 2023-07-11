from ..models import MPSubcategory
from django.db.utils import IntegrityError
from kronos.exceptions import ObjectNotFound,AppLogicError

def find_all_subcategories():
    return MPSubcategory.objects.all()

def save(sub_category):
    sub_category.save()
    return sub_category
def find_subcategory_by_id(subcategory_id):
    try:
        return MPSubcategory.objects.get(pk=subcategory_id)
    except MPSubcategory.DoesNotExist as e:
        raise ObjectNotFound from e
def delete(subcategory_id):
    try:
        sub_category = find_subcategory_by_id(subcategory_id)
        sub_category.delete()
    except IntegrityError as e:
        raise AppLogicError("subcategory cannot be delete now") from e

    