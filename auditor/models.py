from django.utils import timezone
from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.db.models import PROTECT
from django.db.models import Model, CharField, AutoField, DateField, ForeignKey, NullBooleanField, OneToOneField, \
    PositiveSmallIntegerField, DateTimeField, BooleanField

from django.contrib.postgres.fields import JSONField, ArrayField

from manager.models import City
from .validators import numericValidator, minLengthValidator
from kronos.utils import validate_ifsc, validate_pan, get_bank_name_from_ifsc
from manager.service import geo

class CompletableMixin:
    """
    Provides three methods which operate on the `is_complete_attrs` class variable
        - `is_complete`
        - `completed_field_count`
        - `field_count`
    """
    is_complete_attrs = []

    def is_complete(self):
        """returns `True` if number of completed fields matches specified field count"""
        return self.field_count() is self.completed_field_count()

    def completed_field_count(self):
        """returns the count of fields in is_complete_attrs that are complete"""
        count = 0
        for attr in self.is_complete_attrs:
            if getattr(self, attr) not in [None, ""]:
                count += 1
        return count

    def field_count(self):
        """returns the count of fields that need to be complete for the whole instance to be complete"""
        return len(self.is_complete_attrs)



class ProfileInfo(Model, CompletableMixin):
    MALE = 'M'
    FEMALE = 'F'
    TRANS = 'T'
    NON_BINARY = 'N'
    GENDER = (
        (MALE, 'Male'),
        (FEMALE, 'Female'),
        (TRANS, 'Trans person'),
        (NON_BINARY, 'Non-binary')
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

    EXCELLENT = "E"
    GOOD = "G"
    AVERAGE = "A"
    WORSE = "W"
    AUDITOR_RATING = (
        (EXCELLENT, "Excellent"),
        (GOOD, "Good"),
        (AVERAGE, "Average"),
        (WORSE, "Worse"),
    )

    HE_HIM = "hh"
    SHE_HER = "sh"
    THEY_THEM = "tt"
    HE_THEY = "ht"
    SHE_THEY = "st"
    PRONOUNS = (
        (HE_HIM, "He/Him"),
        (SHE_HER, "She/Her"),
        (THEY_THEM, "They/Them"),
        (HE_THEY, "He/They"),
        (SHE_THEY, "She/They")
    )

    id = AutoField(db_column='id', primary_key=True)
    pronouns = CharField(db_column='pronouns', max_length=40, blank=True)
    first_name = CharField(db_column='first_name', max_length=40, blank=True)
    last_name = CharField(db_column='last_name', max_length=40, blank=True)
    gender = CharField(db_column='gender', max_length=1, choices=GENDER, blank=True)
    marital_status = CharField(db_column='marital_status', max_length=1, choices=MARITAL_STATUS, blank=True)
    education = CharField(db_column='education', max_length=2, choices=EDUCATION, blank=True)
    household_income = PositiveSmallIntegerField(db_column='household_income', choices=INCOME, blank=True, null=True)
    mobile_number = CharField(db_column='mobile_number', max_length=10, blank=True, null=True,
                              validators=[numericValidator, minLengthValidator], unique=True)
    whatsapp_number = CharField(db_column='whatsapp_number', max_length=10, blank=True, null=True, validators=[numericValidator, minLengthValidator], unique=True)
    date_of_birth = DateField(db_column='dob', blank=True, null=True)
    address = CharField(db_column='address', max_length=300, blank=True)
    pincode = CharField(db_column='pincode', max_length=8, blank=True, validators=[numericValidator])

    auditor_rating = CharField(db_column='auditor_rating', max_length=1, choices=AUDITOR_RATING, null=True)

    city = ForeignKey(City, db_column='city_id', null=True, blank=True, on_delete=PROTECT)
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)

    attachments = GenericRelation('attachment.Attachment', related_query_name='profile_infos')

    def average_rating(self):
        from audit_store.service import average_rating_for_auditor
        return average_rating_for_auditor(self.user_id)

    def get_pincode(self):
        return self.pincode

    is_complete_attrs = [
        "first_name",
        "last_name",
        "gender",
        "marital_status",
        "education",
        # "household_income",
        "mobile_number",
        "date_of_birth",
        "address",
        "pincode",
        "city",
    ]

    def __str__(self):
        return "Profile: {} {}".format(self.first_name, self.last_name)


class AdditionalInfo(Model, CompletableMixin):
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

    INDUSTRY = (
        ("1", "Advertising and Marketing"),
        ("2", "Agriculture"),
        ("3", "Arts"),
        ("4", "Architecture"),
        ("5", "Advisory"),
        ("6", "Accounting"),
        ("7", "Aviation"),
        ("8", "Apprael"),
        ("9", "Automotive"),
        ("10", "Banking"),
        ("11", "Biotechnology"),
        ("12", "Civil Engineering"),
        ("13", "Civic-Social organization"),
        ("14", "Consumer Goods and Services"),
        ("15", "Cosmetics"),
        ("16", "Entertainment"),
        ("17", "Event Management"),
        ("18", "Financial Services"),
        ("19", "Food and Beverage"),
        ("20", "Graphic Designing"),
        ("21", "Health and Fitnes"),
        ("22", "Hospitality"),
        ("23", "Import-Export Industry"),
        ("24", "Information Technology"),
        ("25", "Insurance"),
        ("26", "Luxury Goods"),
        ("27", "Management Consulting"),
        ("28", "Market Research"),
        ("29", "Medical"),
        ("30", "Music"),
        ("31", "Not for Profit"),
        ("32", "Oil and Energy"),
        ("33", "Pharmaceuticals"),
        ("34", "Photography"),
        ("35", "Real-Estate"),
        ("36", "Retail Industry"),
        ("37", "Sales"),
        ("38", "Sports"),
        ("39", "Supply Chain and Logistics"),
        ("40", "Telecommunications"),
        ("41", "Transportation"),
        ("42", "Veterinary"),
        ("43", "Other"),
    )

    CAR_COST = (
        ("", ""),
        (1, "<3 lacs"),
        (2, "3 lacs – 5 lacs"),
        (3, "5 lacs – 10 lacs"),
        (4, "10 lacs – 15 lacs"),
        (5, "15 lacs and above"),
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
    income = PositiveSmallIntegerField(db_column='income', choices=INCOME, blank=True, null=True)
    mspa_code = CharField(db_column='mspa_code', max_length=10, blank=True, null=True)
    company = CharField(db_column='company', max_length=50, blank=True, null=True)
    industry = CharField(db_column='industry', choices=INDUSTRY, max_length=50, blank=True, null=True)
    car_cost = CharField(db_column='car_cost', choices=CAR_COST, max_length=50, blank=True, null=True)
    car_model = CharField(db_column='car_model', max_length=50, blank=True, null=True)
    laptop_model = CharField(db_column='laptop_model', max_length=50, blank=True, null=True)
    mobile_model = CharField(db_column='mobile_model', max_length=50, blank=True, null=True)
    referral_code = CharField(db_column='referral_code', max_length=10, blank=True, null=True, unique=True)
    referred_by = CharField(db_column='referred_by', max_length=10, blank=True, null=True)
    is_tour_complete = BooleanField(db_column='is_tour_complete', default=False)
    interest_area = ArrayField(CharField(max_length=50), db_column='interest_area', blank=True, null = True)

    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)

    is_complete_attrs = [
        "occupation",
        "distance",
        "industry",
        "company",
        "mobile_model",
        "camera_resoulution",
        "has_car",
        "laptop_owned",
    ]

    def __str__(self):
        return "AdditionalInfo: " + " ".join(["{}" for _ in self.is_complete_attrs]).format(*[getattr(self, attr) for attr in self.is_complete_attrs])


class BankInfo(Model, CompletableMixin):
    id = AutoField(db_column='id', primary_key=True)
    bank_name = CharField(db_column='bank_name', max_length=40, blank=True)
    bank_address = CharField(db_column='bank_address', max_length=300, blank=True)
    account_holder_name = CharField(db_column='account_holder_name', max_length=40, blank=True)
    account_number = CharField(db_column='account_number', max_length=20, blank=True, validators=[numericValidator])
    ifsc_code = CharField(db_column='ifsc_code', max_length=20, blank=True)
    pan_number = CharField(db_column='pan_number', max_length=10, blank=True)

    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)

    is_complete_attrs = [
        # "bank_name",
        "account_holder_name",
        "account_number",
        "ifsc_code",
        "pan_number",
    ]

    def is_payable(self):
        invalid_fields = ["", None]
        return self.account_holder_name not in invalid_fields \
            and self.ifsc_code not in invalid_fields \
            and self.account_number not in invalid_fields

    def is_valid(self):
        return bool(validate_pan(self.pan_number)) and bool(validate_ifsc(self.ifsc_code))

    def is_pan_card_valid(self):
        return bool(validate_pan(self.pan_number))

    def is_ifsc_code_valid(self):
        return bool(validate_ifsc(self.ifsc_code))

    def bank_name_from_ifsc(self):
        return get_bank_name_from_ifsc(self.ifsc_code)


class Preferences(Model):
    id = AutoField(db_column='id', primary_key=True)
    receive_new_opportunities_email = BooleanField(db_column='receive_new_opportunities_email', default=True)
    receive_transactional_email = BooleanField(db_column='receive_transactional_email', default=True)
    receive_new_opportunities_sms = BooleanField(db_column='receive_new_opportunities_sms', default=True)
    receive_transactional_sms = BooleanField(db_column='receive_transactional_sms', default=True)
    receive_transactional_whatsapp_message = BooleanField(db_column='receive_transactional_whatsapp_message', default=True)
    agreement_accepted = BooleanField(db_column='agreement_accepted', default=False)
    pp_accepted = BooleanField(db_column='pp_accepted', default=False)
    full_time_opportunity_email_status = BooleanField(db_column='full_time_opportunity_email_status', default=False)

    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)


class AuditApplication(Model):
    NOT_APPLIED = 'NOT_APPLIED'
    APPLIED = 'APPLIED'
    REJECTED = 'REJECTED'
    WITHDRAWN = 'WITHDRAWN'
    WAITLISTED = 'WAITLISTED'
    APPROVED = 'APPROVED'
    STATUS = (
        (NOT_APPLIED, "Not Applied"),
        (APPLIED, "Applied"),
        (REJECTED, "Rejected"),
        (WITHDRAWN, "Withdrawn"),
        (WAITLISTED, "Wait Listed"),
        (APPROVED, "Approved"),
    )

    id = AutoField(db_column='id', primary_key=True)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    audit_date = DateField(db_column='audit_date')

    audit = ForeignKey('audit.Audit', db_column='audit_id', related_name='applications', on_delete=PROTECT)
    profileinfo = ForeignKey(ProfileInfo, db_column='profileinfo_id', related_name='applications', on_delete=PROTECT)
    report_exists = BooleanField(db_column='report_exists', default=False)
    report_exists_data = JSONField(db_column='report_exists_data', default=dict)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(AuditApplication, self).save(*args, **kwargs)

    def avg_qa_rating(self):
        return self.profileinfo.average_rating()

    def distance(self):
        audit_store_pincode = self.audit.get_pincode_audit()
        auditor_pincode = self.profileinfo.get_pincode()
        distance = geo.calculate_distance_from_pincode(audit_store_pincode, auditor_pincode)
        return distance

    def __str__(self):
        return 'AuditApplication({}): {}, {}'.format(self.id, self.audit, self.profileinfo)

    class Meta:
        unique_together = (("profileinfo", "audit"))


class MobileNumberHistoryLog(Model):
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)
    mobile_number = CharField(db_column='mobile_number', max_length=10, blank=True, null=True,
                              validators=[numericValidator, minLengthValidator])
    created_at = DateTimeField(db_column="created_at")