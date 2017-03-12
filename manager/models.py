from django.conf import settings
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, NullBooleanField, OneToOneField, PositiveIntegerField, DecimalField
from django.db.models import CASCADE

from client.models import Client

from . import states

class City(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    state = CharField(db_column="state", max_length=5, blank=False, choices=states.get_django_choices())
    lat = DecimalField(max_digits=9, decimal_places=6, null=True)
    lon = DecimalField(max_digits=9, decimal_places=6, null=True)

    def __str__(self):
        return 'City({}): {}'.format(self.id, self.name)

    class Meta:
        ordering = ['name']

class Location(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    pincode = CharField(db_column='pincode', max_length=6, blank=False)
    city = ForeignKey(City, related_name='locations', db_column='city_id', blank=False, on_delete=CASCADE)

    def __str__(self):
        return 'Location({}): {}, {}'.format(self.id, self.name, self.city)

