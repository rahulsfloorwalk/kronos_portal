from django.conf import settings
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, NullBooleanField, OneToOneField, PositiveIntegerField
from django.db.models import CASCADE

from . import states

class Client(Model):
    db_table = "client"

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=50, blank=False)
    email = EmailField(db_column='email', max_length=50, blank=False)
    phone = CharField(db_column='phone', max_length=15, blank=True)

    def __str__(self):
        return 'Client({}): {}'.format(self.id, self.name)

class City(Model):
    db_table = "city"

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    state = CharField(db_column="state", max_length=5, blank=False, choices=states.get_django_choices())

    def __str__(self):
        return 'City({}): {}'.format(self.id, self.name)

class Location(Model):
    db_table = "location"

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    pincode = CharField(db_column='pincode', max_length=6, blank=False)
    city = ForeignKey(City, related_name='locations', db_column='city_id', blank=False, on_delete=CASCADE)

    def __str__(self):
        return 'Location({}): {}, {}'.format(self.id, self.name, self.city)

class Audit(Model):
    db_table = "audit"

    WALKIN = 1
    PHONE = 2
    WEB = 3
    VISIBILITY = 4
    COMPETITION = 5
    TYPES = (
        (WALKIN, 'walkin'),
        (PHONE, 'phone'),
        (WEB, 'web'),
        (VISIBILITY, 'visibility'),
        (COMPETITION, 'competition'),
    )

    UPCOMING = 1
    ACTIVE = 2
    ARCHIVED = 3
    STATUS = (
        (UPCOMING, 'upcoming'),
        (ACTIVE, 'active'),
        (ARCHIVED, 'archived'),
    )

    id = AutoField(db_column = 'id', primary_key=True)
    type = IntegerField(db_column='type', choices=TYPES, blank=False)
    status = IntegerField(db_column='status', choices=STATUS, blank=False)
    start_date = DateField(db_column='start_date')
    end_date = DateField(db_column='end_date')
    earnings_per_audit = IntegerField(db_column='earnings_per_audit', blank=False)
    description = CharField(db_column='description', max_length=200, blank=False)
    client = ForeignKey(Client, related_name='audits', db_column='client_id', on_delete=CASCADE)

    def audit_count(self):
        count = 0;
        for al in self.auditlocations.all():
            count = count + al.count
        return count

    def cities(self):
        cities = [al.location.city for al in self.auditlocations.all()]
        return set(cities)

    def __str__(self):
        return "Audit({}): client: {}".format(self.id, self.client)


class AuditLocation(Model):
    db_table = "audit_location"

    id = AutoField(db_column = 'id', primary_key=True)
    count = PositiveIntegerField(db_column='count', blank=False)
    location = ForeignKey(Location, related_name='auditlocations', db_column='location_id', on_delete=CASCADE)
    audit = ForeignKey(Audit, related_name='auditlocations', db_column='audit_id', on_delete=CASCADE)

    def __str__(self):
        return "AuditLocation({}): {}, {}".format(self.id, self.location, self.audit)

    class Meta:
        unique_together = (("location", "audit"))
