from django.conf import settings
from django.db.models import Model, CharField, AutoField, DateTimeField, OneToOneField, BooleanField, PROTECT
from django.contrib.auth.models import User

# Alters auth_user model. email field is unique
User._meta.local_fields[4].__dict__['_unique'] = True

class Verification(Model):
    id = AutoField(db_column='id', primary_key=True)
    activation_key = CharField(max_length=40)
    key_expires = DateTimeField()
    is_verified = BooleanField(db_column='is_verified', default=False)
    user = OneToOneField(settings.AUTH_USER_MODEL, related_name='verification', on_delete=PROTECT)


GROUP_NAME_AUDITOR = "Auditor"
GROUP_NAME_MANAGER = "Manager"
GROUP_NAME_CLIENT = "Client"
GROUP_NAME_MODERATOR = "Moderator"
