from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.db.models import CASCADE
from django.db.models import Model, CharField, AutoField, DateField, ForeignKey, NullBooleanField, OneToOneField, \
    PositiveSmallIntegerField, PositiveIntegerField

from manager.models import City
from .validators import numericValidator, minLengthValidator


class ProfileInfo(Model):
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

    NOT_ANSWERED = 0
    ONE = 1
    ONE_THREE = 2
    THREE_EIGHT = 3
    EIGHT_FIFTEEN = 4
    FIFTEEN_PLUS = 5
    INCOME = (
        (NOT_ANSWERED, "not answered"),
        (ONE, "less than 1		 lpa"),
        (ONE_THREE, "1 to 3 lpa"),
        (THREE_EIGHT, "3 to 8 lpa"),
        (EIGHT_FIFTEEN, "8 to 15 lpa"),
        (FIFTEEN_PLUS, "15+ lpa"),
    )

    id = AutoField(db_column='id', primary_key=True)
    first_name = CharField(db_column='first_name', max_length=40, blank=True)
    last_name = CharField(db_column='last_name', max_length=40, blank=True)
    gender = CharField(db_column='gender', max_length=1, choices=GENDER, blank=True)
    marital_status = CharField(db_column='marital_status', max_length=1, choices=MARITAL_STATUS, blank=True)
    education = CharField(db_column='education', max_length=2, choices=EDUCATION, blank=True)
    household_income = PositiveSmallIntegerField(db_column='household_income', choices=INCOME, blank=True, null=True)
    mobile_number = CharField(db_column='mobile_number', max_length=10, blank=True, null=True,
                              validators=[numericValidator, minLengthValidator], unique=True)
    date_of_birth = DateField(db_column='dob', blank=True, null=True)
    address = CharField(db_column='address', max_length=300, blank=True)
    pincode = CharField(db_column='pincode', max_length=8, blank=True, validators=[numericValidator])

    city = ForeignKey(City, db_column='city_id', null=True, blank=True)
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)

    attachments = GenericRelation('attachment.Attachment', related_query_name='profile_infos')

    def is_complete(self):
        complete = True
        if self.first_name in [None, ""]: complete = False
        if self.last_name in [None, ""]: complete = False
        if self.gender in [None, ""]: complete = False
        if self.marital_status in [None, ""]: complete = False
        if self.education in [None, ""]: complete = False
        # if self.household_income in [None, ""]: complete = False
        if self.mobile_number in [None, ""]: complete = False
        if self.date_of_birth is None: complete = False
        if self.address in [None, ""]: complete = False
        if self.pincode in [None, ""]: complete = False
        if self.city in [None, ""]: complete = False

        return complete

    def __str__(self):
        return "Profile: {} {}".format(self.first_name, self.last_name)


class AdditionalInfo(Model):
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

    STUDENT = "STUDENT"
    SERVICE = "SERVICE"
    SELF_EMPLOYED = "SELF_EMPLOYED"
    BUSINESS = "BUSINESS"
    UNEMPLOYED = "UNEMPLOYED"
    RETIRED = "RETIRED"
    OCCUPATION = (
        (STUDENT, 'student'),
        (SERVICE, 'service'),
        (SELF_EMPLOYED, 'self employed'),
        (BUSINESS, 'business'),
        (UNEMPLOYED, 'unemployed'),
        (RETIRED, 'retired'),
    )

    id = AutoField(db_column='id', primary_key=True)
    ethnicity = PositiveSmallIntegerField(db_column='ethnicity', choices=ETHNICITY, blank=True, null=True)
    hair_color = PositiveSmallIntegerField(db_column='hair_color', choices=HAIR_COLOR, blank=True, null=True)
    height = PositiveSmallIntegerField(db_column='height', blank=True, null=True)
    weight = PositiveSmallIntegerField(db_column='weight', blank=True, null=True)
    distance = PositiveSmallIntegerField(db_column='distance', blank=True, null=True)
    has_car = NullBooleanField(db_column='has_car', blank=True, null=True)
    camera_owned = NullBooleanField(db_column='camera_owned', blank=True, null=True)
    camera_resoulution = PositiveSmallIntegerField(db_column='camera_resolution', choices=RESOLUTION, blank=True,
                                                   null=True)
    pda_owned = NullBooleanField(db_column='pda_owned', blank=True, null=True)
    smart_phone_owned = NullBooleanField(db_column='smart_phone_owned', blank=True, null=True)
    laptop_owned = NullBooleanField(db_column='laptop_owned', blank=True, null=True)
    fax_access = NullBooleanField(db_column='fax_access', blank=True, null=True)
    scanner_access = NullBooleanField(db_column='scanner_access', blank=True, null=True)
    weekend_audit = NullBooleanField(db_column='weekend_audit', blank=True, null=True)
    occupation = CharField(db_column='occupation', choices=OCCUPATION, max_length=20, blank=True, null=True)
    mspa_code = CharField(db_column='mspa_code', max_length=10, blank=True, null=True)
    company = CharField(db_column='company', max_length=50, blank=True, null=True)
    industry = CharField(db_column='industry', max_length=50, blank=True, null=True)
    car_cost = PositiveIntegerField(db_column='car_cost', blank=True, null=True)
    car_model = CharField(db_column='car_model', max_length=50, blank=True, null=True)
    laptop_model = CharField(db_column='laptop_model', max_length=50, blank=True, null=True)
    mobile_model = CharField(db_column='mobile_model', max_length=50, blank=True, null=True)
    referral_code = CharField(db_column='referral_code', max_length=10, blank=True, null=True, unique=True)
    referred_by = CharField(db_column='referred_by', max_length=10, blank=True, null=True)

    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)

    def is_complete(self):
        complete = True
        if self.occupation in [None, ""]: complete = False
        if self.distance in [None, ""]: complete = False
        if self.industry in [None, ""]: complete = False
        if self.company in [None, ""]: complete = False
        if self.mobile_model in [None, ""]: complete = False
        if self.camera_resoulution in [None, ""]: complete = False
        if self.has_car and (self.car_model in [None, ""] or self.car_cost in [None, ""]): complete = False
        if self.laptop_owned and self.laptop_model in [None, ""]: complete = False
        return complete


class BankInfo(Model):
    id = AutoField(db_column='id', primary_key=True)
    bank_name = CharField(db_column='bank_name', max_length=40, blank=True)
    bank_address = CharField(db_column='bank_address', max_length=300, blank=True)
    account_holder_name = CharField(db_column='account_holder_name', max_length=40, blank=True)
    account_number = CharField(db_column='account_number', max_length=20, blank=True, validators=[numericValidator])
    ifsc_code = CharField(db_column='ifsc_code', max_length=20, blank=True)
    pan_number = CharField(db_column='pan_number', max_length=10, blank=True)

    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=CASCADE)

    def is_complete(self):
        complete = True
        if self.bank_name in [None, ""]: complete = False
        if self.account_holder_name in [None, ""]: complete = False
        if self.account_number in [None, ""]: complete = False
        if self.ifsc_code in [None, ""]: complete = False
        if self.pan_number in [None, ""]: complete = False
        return complete


class AuditApplication(Model):
    NOT_APPLIED = 'NOT_APPLIED'
    APPLIED = 'APPLIED'
    REJECTED = 'REJECTED'
    APPROVED = 'APPROVED'
    STATUS = (
        (NOT_APPLIED, "Not Applied"),
        (APPLIED, "Applied"),
        (REJECTED, "Rejected"),
        (APPROVED, "Approved"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    audit = ForeignKey('audit.Audit', db_column='audit_id', related_name='applications')
    profileinfo = ForeignKey(ProfileInfo, db_column='profileinfo_id', related_name='applications')

    def __str__(self):
        return 'AuditApplication({}): {}, {}'.format(self.id, self.audit, self.profileinfo)

    class Meta:
        unique_together = (("profileinfo", "audit"))
