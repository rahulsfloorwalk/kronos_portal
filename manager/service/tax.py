from ..models import MPTax
from django.db.utils import IntegrityError

from kronos.exceptions import ObjectNotFound,AppLogicError
def find_all_taxs():
    return MPTax.objects.all()

def save(tax):
    tax.save()
    return tax

def find_tax_by_id(tax_id):
    try:
        return MPTax.objects.get(pk=tax_id)
    except MPTax.DoesNotExist as e:
        raise ObjectNotFound from e
    
def delete(tax_id):
    try:
        tax = find_tax_by_id(tax_id)
        tax.delete()
    except IntegrityError as e:
        raise AppLogicError("tax cannot be delete now") from e
