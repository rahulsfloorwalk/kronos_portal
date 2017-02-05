from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, NullBooleanField, OneToOneField, PositiveIntegerField
from django.db.models import CASCADE
from django.conf import settings

class Client(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=50, blank=False)
    email = EmailField(db_column='email', max_length=50, blank=False)
    phone = CharField(db_column='phone', max_length=15, blank=True)

    def __str__(self):
        return 'Client({}): {}'.format(self.id, self.name)


class ClientUser(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    full_name = CharField(db_column='name', max_length=50, blank=False)
    client = ForeignKey(Client, related_name='users', db_column='client_id', blank=False)
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)

    def __str__(self):
        return 'Client({}): {}'.format(self.id, self.name)


class Store(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=50, blank=False)
    address = CharField(db_column='address', max_length=1024, blank=False)
    location = ForeignKey('manager.Location', db_column='location_id', blank=False)
    client = ForeignKey(Client, related_name='stores', db_column='client_id', on_delete=CASCADE)

    def __str__(self):
        return 'Client({}): {}'.format(self.id, self.name)
