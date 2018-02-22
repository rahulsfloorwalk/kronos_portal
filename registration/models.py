from django.conf import settings
from django.db.models import Model, CharField, AutoField, DateTimeField, OneToOneField, BooleanField, ForeignKey, PROTECT
from django.contrib.auth.models import User

# Alters auth_user model. email field is unique
User._meta.local_fields[4].__dict__['_unique'] = True

class Verification(Model):
    id = AutoField(db_column='id', primary_key=True)
    activation_key = CharField(db_column='activation_key', max_length=40, unique=True)
    key_expires = DateTimeField(db_column='key_expires')
    is_verified = BooleanField(db_column='is_verified', default=False)
    user = OneToOneField(settings.AUTH_USER_MODEL, related_name='verification', on_delete=PROTECT)


class MobileNumber(Model):
    id = AutoField(db_column='id', primary_key=True)
    mobile_number = CharField(db_column='mobile_number', max_length=10, blank=False, null=False)
    activation_key = CharField(db_column='activation_key', max_length=40, unique=True, blank=False, null=False)
    key_expires = DateTimeField(db_column='key_expires', blank=False, null=False)
    is_verified = BooleanField(db_column='is_verified', default=False)
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', related_name='mobile_numbers', on_delete=PROTECT)

    def __str__(self):
        return 'MobileNumber({}): {}, user:{}'.format(self.id, self.mobile_number, self.user_id)


GROUP_NAME_AUDITOR = "Auditor"
GROUP_NAME_MANAGER = "Manager"
GROUP_NAME_CLIENT = "Client"
GROUP_NAME_MODERATOR = "Moderator"
GROUP_NAME_AGENCY = "Agency"
