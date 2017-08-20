from django.contrib.postgres.fields import JSONField
from django.db.models import Model, CharField, AutoField, DateTimeField, OneToOneField, BooleanField
from django.conf import settings
from django.db.models import CASCADE


class Facebook(Model):
    id = AutoField(db_column='id', primary_key=True)
    facebook_id = CharField(db_column="facebook_id", max_length=64, blank=True, null=True)
    access_token = CharField(db_column="access_token", max_length=1024, blank=True, null=True)
    profile_data = JSONField(db_column='profile_data', default=dict(), blank=True, null=True)
    created_date = DateTimeField(auto_now_add=True)
    modified_date = DateTimeField(auto_now=True)
    is_verified = BooleanField(db_column='is_verified', default=False, null=False, blank=False)

    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)