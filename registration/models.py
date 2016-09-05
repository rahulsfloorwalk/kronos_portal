from django.conf import settings
from django.db.models import Model, CharField, AutoField, DateTimeField, OneToOneField
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from datetime import datetime

class Verification(Model):
	id = AutoField(db_column='id', primary_key=True)
	activation_key = CharField(max_length=40)
	key_expires = DateTimeField()
	user = OneToOneField(settings.AUTH_USER_MODEL, related_name='verification')
