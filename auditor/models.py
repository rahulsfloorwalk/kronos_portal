from django.conf import settings
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, ForeignKey, NullBooleanField, OneToOneField, PositiveSmallIntegerField
from django.db.models import CASCADE
from django.core.validators import RegexValidator, MinLengthValidator
from .validators import numericValidator, minLengthValidator
from manager.models import AuditLocation


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
	mobile_number = CharField(db_column='mobile_number', max_length=10, blank=True, validators=[numericValidator, minLengthValidator])
	date_of_birth = DateField(db_column='dob', blank=True, null=True)
	address = CharField(db_column='address', max_length=100, blank=True)
	pincode = CharField(db_column='pincode', max_length=8, blank=True, validators=[numericValidator])
	city = CharField(db_column='city', max_length=20, blank=True)
	state = CharField(db_column='state', max_length=20, blank=True)

	user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)

	def __str__(self):
		return "Profile: {} {}".format(self.first_name, self.last_name)

class AdditionalInfo(Model):
	db_table = "additional_info"

	AFRICAN_AMERICAN = 1
	ASIAN = 2
	CAUCASIAN = 3
	HISPANIC = 4
	MIDDLE_EASTERN = 5
	NATIVE_AMERICAN = 6
	OTHER = 7
	ETHNICITY = (
		(AFRICAN_AMERICAN, "african american"),
		(ASIAN, "asian"),
		(CAUCASIAN, "caucasian"),
		(HISPANIC, "hispanic"),
		(MIDDLE_EASTERN, "middle eastern"),
		(NATIVE_AMERICAN, "native american"),
		(OTHER, "other"),
	)

	BLACK = 1
	BLONDE = 2
	BROWN = 3
	RED = 4
	GREY = 5
	WHITE = 6
	BALD = 7
	OTHER = 8
	HAIR_COLOR = (
		(BLACK, "black"),
		(BLONDE, "blonde"),
		(BROWN, "brown"),
		(RED, "red"),
		(GREY, "grey"),
		(WHITE, "white"),
		(BALD, "bald"),
		(OTHER, "other"),
	)

	ONE = 1
	FIVE = 2
	TEN = 3
	FIFTEEN = 4
	DONT_KNOW = 5
	NO_CAMERA = 6
	RESOLUTION = (
		(ONE, "1 to 5 megapixel"),
		(FIVE, "5 to 10 megapixel"),
		(TEN, "10 to 15 megapixel"),
		(FIFTEEN, "15+ megapixel"),
		(DONT_KNOW, "dont know"),
		(NO_CAMERA, "no camera"),
	)

	id = AutoField(db_column='id', primary_key=True)
	ethnicity = PositiveSmallIntegerField(db_column='ethnicity', choices=ETHNICITY, blank=True, null=True)
	hair_color = PositiveSmallIntegerField(db_column='hair_color', choices=HAIR_COLOR, blank=True, null=True)
	height = PositiveSmallIntegerField(db_column='height', blank=True, null=True)
	weight = PositiveSmallIntegerField(db_column='weight', blank=True, null=True)
	distance = PositiveSmallIntegerField(db_column='distance', blank=True, null=True)
	has_car = NullBooleanField(db_column='has_car', blank=True, null=True)
	camera_owned = NullBooleanField(db_column='camera_owned', blank=True, null=True)
	camera_resoulution = PositiveSmallIntegerField(db_column='camera_resolution', choices=RESOLUTION, blank=True, null=True)
	pda_owned = NullBooleanField(db_column='pda_owned', blank=True, null=True)
	smart_phone_owned = NullBooleanField(db_column='smart_phone_owned', blank=True, null=True)
	laptop_owned = NullBooleanField(db_column='laptop_owned', blank=True, null=True)
	fax_access = NullBooleanField(db_column='fax_access', blank=True, null=True)
	scanner_access = NullBooleanField(db_column='scanner_access', blank=True, null=True)
	weekend_audit = NullBooleanField(db_column='weekend_audit', blank=True, null=True)

	user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)

class BankInfo(Model):
	db_table = "bank_info"

	id = AutoField(db_column='id', primary_key=True)
	bank_name = CharField(db_column='bank_name', max_length=40, blank=True)
	account_holder_name = CharField(db_column='account_holder_name', max_length=40, blank=True)
	account_number = CharField(db_column='account_number', max_length=20, blank=True, validators=[numericValidator])
	ifsc_code = CharField(db_column='ifsc_code', max_length=20, blank=True)
	pan_number = CharField(db_column='pan_number', max_length=10, blank=True)

	user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)

class AuditApplication(Model):
    db_table = "audit_application"

    NOT_APPLIED = 'NOT_APPLIED'
    APPLIED = 'APPLIED'
    REJECTED = 'REJECTED'
    ASSIGNED = 'ASSIGNED'
    FAILED = 'FAILED'
    COMPLETED = 'COMPLETED'
    STATUS = (
            (NOT_APPLIED, "Not Applied"),
            (APPLIED, "Applied"),
            (REJECTED, "Rejected"),
            (ASSIGNED, "Assigned"),
            (FAILED, "Failed"),
            (COMPLETED, "Completed"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    auditlocation = ForeignKey(AuditLocation, db_column='audit_location_id', related_name='applications')
    profileinfo = ForeignKey(ProfileInfo, db_column='profileinfo_id', related_name='applications')

    def __str__(self):
        return 'AuditApplication({}): {}, {}'.format(self.id, self.auditlocation, self.profileinfo)

    class Meta:
        unique_together = (("profileinfo", "auditlocation"))
