from django.conf import settings
from django.db import models

class ProfileInfo(models.Model):
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

	id = models.IntegerField(db_column='id', primary_key=True)
	first_name = models.CharField(db_column='first_name', max_length=20)
	last_name = models.CharField(db_column='last_name', max_length=20)
	gender = models.CharField(db_column='gender', max_length=1, choices=GENDER)
	marital_status = models.CharField(db_column='marital_status', max_length=1, choices=MARITAL_STATUS)
	education = models.CharField(db_column='education', max_length=2, choices=EDUCATION)
	mobile_number = models.TextField(db_column='mobile_number', max_length='10')
	date_of_birth = models.DateField(db_column='dob')
	address = models.TextField(db_column='address', max_length='100')
	pincode = models.TextField(db_column='pincode', max_length='8')
	city = models.TextField(db_column='city', max_length='20')
	state = models.TextField(db_column='state', max_length='20')

	#user_id = models.IntegerField(db_column='user_id')
	user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE)


class AdditionalInfo(models.Model):
	db_table = "additional_info"

	id = models.IntegerField(db_column='id', primary_key=True)
	has_car = models.BooleanField(db_column='has_car')
	weekend_audit = models.BooleanField(db_column='weekend_audit')

	#user_id = models.IntegerField(db_column='user_id')
	user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE)

class BankInfo(models.Model):
	db_table = "bank_info"

	id = models.IntegerField(db_column='id', primary_key=True)
	bank_name = models.TextField(db_column='bank_name', max_length='40')
	account_holder_name = models.TextField(db_column='account_holder_name', max_length='40')
	account_number = models.TextField(db_column='account_number', max_length='20')
	ifsc_code = models.TextField(db_column='ifsc_code', max_length='20')

	#user_id = models.IntegerField(db_column='user_id')
	user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE)
