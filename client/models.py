from django.db.models import Model, CharField, AutoField, EmailField, ForeignKey, OneToOneField
from django.contrib.postgres.fields import JSONField
from django.db.models import PROTECT
from django.conf import settings

class Client(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=50, blank=False)
    brand_name = CharField(db_column='brand_name', max_length=50, blank=True)
    email = EmailField(db_column='email', max_length=50, blank=False)
    phone = CharField(db_column='phone', max_length=15, blank=True)
    logo_url = CharField(db_column='logo_url', max_length=512, blank=True)
    brand_logo_url = CharField(db_column='brand_logo_url', max_length=512, blank=True)

    def auditor_logo_url(self):
        return self.brand_logo_url or self.logo_url

    def auditor_display_name(self):
        return self.brand_name or self.name

    def __str__(self):
        return 'Client({}): {}'.format(self.id, self.name)

    class Meta:
        ordering = ['name']


class ClientUser(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    full_name = CharField(db_column='full_name', max_length=50, blank=False)
    client = ForeignKey(Client, related_name='users', db_column='client_id', blank=False, on_delete=PROTECT)
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)

    def __str__(self):
        return 'ClientUser({}): {}, client: {}'.format(self.id, self.full_name, self.client)

    def is_client_admin(self):
        return self.user.has_perm('client.clientuser_admin')

    class Meta:
        permissions = (
            ('clientuser_admin', 'ClientUser can view all reports, the dashboard and access related reporting APIs'),
        )


class Store(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    code = CharField(db_column='code', max_length=20, blank=True, null=True, default=None)
    type = CharField(db_column='type', max_length=20, blank=True, default='')
    priority = CharField(db_column='priority', max_length=5, blank=True, default='')
    name = CharField(db_column='name', max_length=500, blank=False)
    address = CharField(db_column='address', max_length=1024, blank=False)
    location = ForeignKey('manager.Location', db_column='location_id', blank=True, null=True, on_delete=PROTECT)
    city = ForeignKey('manager.City', db_column='city_id', null=True, on_delete=PROTECT)
    client = ForeignKey(Client, related_name='stores', db_column='client_id', on_delete=PROTECT)
    phone = CharField(db_column='phone', max_length=100, blank=True)
    extra_data = JSONField(db_column='extra_data', default=dict(), blank=False)

    def __str__(self):
        return 'Store({}): {}, client: {}'.format(self.id, self.name, self.client)

    class Meta:
        unique_together = ("client", "code")
        permissions = (
            ('clientuser_store_visible', 'ClientUser can view all AuditStore instances for this Store'),
        )
