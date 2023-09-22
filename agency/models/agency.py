from django.db.models import QuerySet, Model
from django.db.models import CharField, AutoField, IntegerField, BooleanField

from kronos.utils import validate_ifsc, get_bank_name_from_ifsc

class AgencyQuerySet(QuerySet):
    def create_agency(self, agency_name, agreement_accepted):
        a = Agency()
        a.name = agency_name
        a.agreement_accepted = agreement_accepted
        a.save()
        return a

class Agency(Model):
    objects = AgencyQuerySet.as_manager()

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=50, blank=False)
    formed_in_year = IntegerField(db_column='formed_in_year', blank=True, null=True)
    gstin = CharField(db_column='gstin', max_length=15, blank=True)
    cin = CharField(db_column='cin', max_length=21, blank=True)
    agreement_accepted = BooleanField(db_column='agreement_accepted', default=False)
    strength = IntegerField(db_column='strength', blank=True, null=True)
    account_holder_name = CharField(db_column='account_holder_name', max_length=40, blank=True)
    account_number = CharField(db_column='account_number', max_length=20, blank=True)
    ifsc_code = CharField(db_column='ifsc_code', max_length=20, blank=True)

    # def is_ifsc_code_valid(self):
    #     return bool(validate_ifsc(self.ifsc_code))

    def bank_name_from_ifsc(self):
        return get_bank_name_from_ifsc(self.ifsc_code)

    def __str__(self):
        return 'Agency({}): {}'.format(self.id, self.name)

    def is_bank_details_complete(self):
        incomplete_fields = [None, '']
        account_number_valid = self.account_number not in incomplete_fields
        ifsc_valid = self.ifsc_code not in incomplete_fields 
        bank_holder_name_valid = self.account_holder_name not in incomplete_fields
        return account_number_valid and ifsc_valid and bank_holder_name_valid

    class Meta:
        ordering = ['name']

