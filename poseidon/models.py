from django.db import models
from django.contrib.auth.models import User

class ProfileInfo(models.Model):

	MALE = 'M'
	FEMALE = 'F'
	GENDER = (
		(MALE, 'male'),
		(FEMALE, 'female'),
	)

	SINGLE = 'SI'
	MARRIED = 'MA'
	SEPARATED = 'SE'
	MARITAL_STATUS = (
		(SINGLE, 'single'),
		(MARRIED, 'married'),
		(SEPARATED, 'separated'),
	)

	TENTH = 'TE'
	TWELVTH = 'TW'
	COLLEGE = 'CO'
	GRADUATE = 'GR'
	POST_GRADUATE = 'PG'
	OTHER = 'OT'
	EDUCATION = (
		(TENTH, "tenth"),
		(TWELVTH, "twelvth"),
		(COLLEGE, "college"),
		(GRADUATE, "graduate"),
		(POST_GRADUATE, "post_graduate"),
		(OTHER, "other"),
	)



	gender = models.CharField(db_column='gender', max_length=1, choices=GENDER)
	marital_status = models.CharField(db_column='marital_status', max_length=2, choices=MARITAL_STATUS)
	education = models.CharField(db_column='education', max_length=2, choices=EDUCATION)
	# profession
	# household_inclome
	user = models.ForeignKey(User, db_column='user_id', on_delete=models.CASCADE)
	mobile_number = models.TextField(db_column='mobile_number', max_length='15')
	date_of_birth = models.DateField(db_column='dob')
	address = models.TextField(db_column='address', max_length='100')
	pincode = models.TextField(db_column='pincode', max_length='10')
	city = models.TextField(db_column='city', max_length='20')
	state = models.TextField(db_column='state', max_length='20')


class AdditionalInfo(models.Model):
	user = models.ForeignKey(User, db_column='user_id', on_delete=models.CASCADE)
	has_car = models.BooleanField(db_column='has_car')
	weekend_audit = models.BooleanField(db_column='weekend_audit')

class BankInfo(models.Model):
	user = models.ForeignKey(User, db_column='user_id', on_delete=models.CASCADE)
	bank_name = models.TextField(db_column='bank_name', max_length='40')
	account_holder_name = models.TextField(db_column='account_holder_name', max_length='40')
	account_number = models.TextField(db_column='account_number', max_length='20')
	ifsc_code = models.TextField(db_column='ifsc_code', max_length='20')