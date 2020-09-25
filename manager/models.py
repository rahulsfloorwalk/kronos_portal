from django.db.models import Model, CharField, AutoField, ForeignKey, DecimalField, BooleanField, DateTimeField
from django.db.models import PROTECT
from django.utils import timezone

from manager import states
from manager import country


class City(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    state = CharField(db_column="state", max_length=5, blank=False, choices=states.get_django_choices())
    country = CharField(db_column="country", max_length=5, blank=False, default="IN", choices=country.get_country_django_choices())
    lat = DecimalField(max_digits=9, decimal_places=6, null=True)
    lon = DecimalField(max_digits=9, decimal_places=6, null=True)

    def __str__(self):
        return 'City({}): {}'.format(self.id, self.name)

    def gmaps_url(self):
        return 'http://maps.google.com/maps/place/{}/@{},{},12z'.format(self.name, self.lat, self.lon)

    def state_name(self):
        return states.states.get(self.state)

    class Meta:
        ordering = ['name']

class Location(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    pincode = CharField(db_column='pincode', max_length=6, blank=False)
    city = ForeignKey(City, related_name='locations', db_column='city_id', blank=False, on_delete=PROTECT)

    def __str__(self):
        return 'Location({}): {}, {}'.format(self.id, self.name, self.city)


class ProofTag(Model):
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False)
    description = CharField(db_column='description', max_length=1000, blank=True)
    is_active = BooleanField(db_column='is_active', default=True)
    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save update timestamp '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(ProofTag, self).save(*args, **kwargs)
