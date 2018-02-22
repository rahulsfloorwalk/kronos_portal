from django.db.models import QuerySet, Model
from django.db.models import CharField, AutoField, IntegerField, BooleanField

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

    def __str__(self):
        return 'Agency({}): {}'.format(self.id, self.name)

    class Meta:
        ordering = ['name']

