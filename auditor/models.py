from django.conf import settings
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, ForeignKey, NullBooleanField, OneToOneField
from django.db.models import CASCADE

class ProfileInfo(Model):
	db_table = "profile_info"

	MALE = 'M'
	FEMALE = 'F'
	GENDER = (
		(MALE, 'Male'),
		(FEMALE, 'Female'),
	)

	SINGLE = 'S'
	MARRIED = 'M'
	DIVORCED = 'D'
	WIDOWED = 'W'
	MARITAL_STATUS = (
		(SINGLE, 'Single'),
		(MARRIED, 'Married'),
		(DIVORCED, 'Divorced'),
		(WIDOWED, 'Widowed'),
	)

	TENTH = 'TE'
	TWELFTH = 'TW'
	COLLEGE = 'CO'
	GRADUATE = 'GR'
	POST_GRADUATE = 'PG'
	EDUCATION = (
		(TENTH, "10th (Middle School)"),
		(TWELFTH, "12th (High School)"),
		(COLLEGE, "In College"),
		(GRADUATE, "Graduate"),
		(POST_GRADUATE, "Post Graduate and Above"),
	)

	id = AutoField(db_column='id', primary_key=True)
	first_name = CharField(db_column='first_name', max_length=20, blank=True)
	last_name = CharField(db_column='last_name', max_length=20, blank=True)
	gender = CharField(db_column='gender', max_length=1, choices=GENDER, blank=True)
	marital_status = CharField(db_column='marital_status', max_length=1, choices=MARITAL_STATUS, blank=True)
	education = CharField(db_column='education', max_length=2, choices=EDUCATION, blank=True)
	mobile_number = CharField(db_column='mobile_number', max_length=10, blank=True)
	date_of_birth = DateField(db_column='dob', blank=True, null=True)
	address = CharField(db_column='address', max_length=100, blank=True)
	pincode = CharField(db_column='pincode', max_length=8, blank=True)
	city = CharField(db_column='city', max_length=20, blank=True)
	state = CharField(db_column='state', max_length=20, blank=True)

	#user_id = models.IntegerField(db_column='user_id')
	user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)


class AdditionalInfo(Model):
	db_table = "additional_info"

	id = AutoField(db_column='id', primary_key=True)
	has_car = NullBooleanField(db_column='has_car', blank=True, null=True)
	weekend_audit = NullBooleanField(db_column='weekend_audit', blank=True, null=True)

	#user_id = models.IntegerField(db_column='user_id')
	user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)

class BankInfo(Model):
	db_table = "bank_info"

	id = AutoField(db_column='id', primary_key=True)
	bank_name = CharField(db_column='bank_name', max_length=40, blank=True)
	account_holder_name = CharField(db_column='account_holder_name', max_length=40, blank=True)
	account_number = CharField(db_column='account_number', max_length=20, blank=True)
	ifsc_code = CharField(db_column='ifsc_code', max_length=20, blank=True)

	#user_id = models.IntegerField(db_column='user_id')
	user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)
