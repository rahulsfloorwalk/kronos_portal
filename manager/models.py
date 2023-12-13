from django.db.models import Model,CASCADE,SET_NULL, CharField, AutoField,PositiveIntegerField, ForeignKey, DecimalField, BooleanField, DateTimeField, IntegerField
from django.db.models import PROTECT
from django.utils import timezone
from kronos.exceptions import AppLogicError
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericRelation
from manager import states
from django.contrib.postgres.fields import JSONField
from django.conf import settings
from manager import country
from jsonschema import validate
from jsonschema.exceptions import ValidationError
import re
from django.db.models import Model, QuerySet, CharField, AutoField, EmailField, ForeignKey,DateField, OneToOneField, DateTimeField, BooleanField, DecimalField,IntegerField


class City(Model):

    TIER_1 = '1'
    TIER_2 = '2'
    TIER_3 = '3'

    TIER_CHOICES = (
        (TIER_1, "Tier 1"),
        (TIER_2, "Tier 2"),
        (TIER_3, "Tier 3"),
    )

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    state = CharField(db_column="state", max_length=5, blank=False, choices=states.get_django_choices())
    country = CharField(db_column="country", max_length=5, blank=False, default="IN", choices=country.get_country_django_choices())
    lat = DecimalField(max_digits=9, decimal_places=6, null=True)
    lon = DecimalField(max_digits=9, decimal_places=6, null=True)
    tier = IntegerField(db_column="tier", default=TIER_3, choices=TIER_CHOICES)

    def __str__(self):
        return 'City({}): {}'.format(self.id, self.name)

    def gmaps_url(self):
        return 'http://maps.google.com/maps/place/{}/@{},{},12z'.format(self.name, self.lat, self.lon)

    def state_name(self):
        return states.states.get(self.state)

    class Meta:
        ordering = ['name']

class Location(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    pincode = CharField(db_column='pincode', max_length=6, blank=False)
    city = ForeignKey(City, related_name='locations', db_column='city_id', blank=False, on_delete=PROTECT)

    def __str__(self):
        return 'Location({}): {}, {}'.format(self.id, self.name, self.city)


class ProofTag(Model):
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False)
    description = CharField(db_column='description', max_length=1000, blank=True)
    is_active = BooleanField(db_column='is_active', default=True)
    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save update timestamp '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(ProofTag, self).save(*args, **kwargs)


class ManagerPermissions(Model):

    class Meta:
        managed = False
        default_permissions = ()
        permissions = (
            ('can_view_reports', 'Can view reports'),
            ('can_change_system_cost', 'Can change system cost'),
            ('can_change_price_per_audit', 'Can change price per audit'),
        )
        
        
class MPTax(Model):
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False)
    rate = PositiveIntegerField(db_column='rate', blank=False)
    def __str__(self):
        return 'Tax({}): {}, {}'.format(self.id, self.name, self.rate)

class MPCategory(Model):
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False)
    url_structure = CharField(db_column='url_structure', max_length=200, blank=False,unique=True)
    overview = CharField(db_column='overview', max_length=16384, blank=False)
    short_description = CharField(db_column='short_description', max_length=250, blank=False)
    attachments = GenericRelation('attachment.Attachment', related_query_name='categories')
    def __str__(self):
        return 'Category({}): {}'.format(self.id, self.name)

class MPSolution(Model):
    WALKIN = 'WALKIN'
    PHONE = 'PHONE'
    WEB = 'WEB'
    VISIBILITY = 'VISIBILITY'
    COMPETITION = 'COMPETITION'
    SERVICE = 'SERVICE'
    SALES = 'SALES'
    FINE_DINE = 'FINE_DINE'
    SKY_KARTING = 'SKY_KARTING'
    SMAAASH_ARENA = 'SMAAASH_ARENA'
    GENERAL = 'GENERAL'
    SMAAASH = 'SMAAASH'
    SMAAASH_MEGA = 'SMAAASH_MEGA'
    SMAAASH_ZONE = 'SMAAASH_ZONE'
    DDC = 'DDC'
    HTC = 'HTC'
    ASCVD = 'ASCVD'
    SKIN_HYDRATION = 'SKIN_HYDRATION'
    HYPER_PIGMENTATION = 'HYPER_PIGMENTATION'
    SKIN_SENSITIVE = 'SKIN_SENSITIVE'
    RETAIL = 'RETAIL'

    TYPES = (
        (WALKIN, 'Walkin'),
        (PHONE, 'Phone'),
        (WEB, 'Web'),
        (VISIBILITY, 'Visibility'),
        (COMPETITION, 'Competition'),
        (SERVICE, 'Service'),
        (SALES, 'Sales'),
        (FINE_DINE, 'Fine Dine'),
        (SKY_KARTING, 'Sky Karting'),
        (SMAAASH_ARENA, 'Smaaash Arena'),
        (GENERAL, 'General'),
        (SMAAASH, 'Smaaash'),
        (SMAAASH_MEGA, 'Smaaash Mega'),
        (SMAAASH_ZONE, 'Smaaash Zone'),
        (DDC, 'Ddc'),
        (HTC, 'Htc'),
        (ASCVD, 'Ascvd'),
        (SKIN_HYDRATION, 'Skin Hydration'),
        (HYPER_PIGMENTATION, 'Hyper Pigmentation'),
        (SKIN_SENSITIVE, 'Skin Sensitive'),
        (RETAIL, 'Retail')
    )
    
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False,unique=True)
    url_structure = CharField(db_column='url_structure',max_length=200,blank=False,unique=True)
    audit_type = CharField(db_column='audit_type', max_length=20, choices=TYPES, blank=False)
    price = PositiveIntegerField(db_column='price',blank=False,default=0)
    tax = ForeignKey(MPTax, related_name='mpsolutions', db_column='tax_id', blank=False, on_delete=PROTECT)
    overview = CharField(db_column='overview', max_length=16384, blank=False)
    how_it_work = CharField(db_column='how_it_work', max_length=16384, blank=False)
    execution_time = CharField(db_column='execution_time', max_length=16384, blank=False)
    short_description = CharField(db_column='short_description', max_length=250, blank=False)
    is_active = BooleanField(db_column='is_active',default=True,blank=False)
    is_show = BooleanField(db_column='is_show',default=False,blank=False)
    is_popular = BooleanField(db_column='is_popular',default=False,blank=False)
    attachments = GenericRelation('attachment.Attachment', related_query_name='solutions')
    
    def __str__(self):
        return 'Solution({}): {}'.format(self.id, self.name)

class MPSolutionCategoryDetails(Model):
    id = AutoField(db_column='id', primary_key=True)
    category = ForeignKey(MPCategory, related_name='mpsolutioncategorydetails', db_column='category_id', blank=True, on_delete=PROTECT)
    solution = ForeignKey(MPSolution, related_name='mpsolutioncategorydetails', db_column='solution_id', blank=True, on_delete=PROTECT)
    def __str__(self):
        return 'SolutionCategoryDetails({}): category{} solution{}'.format(self.id, self.category,self.solution)

class MPSolutionQuestion(Model):
    PLAIN = "PLAIN"
    MUTEX = "MUTEX"
    MULTISELECT = "MULTISELECT"
    QUESTION_TYPE = (
        (PLAIN, "Plain"),
        (MUTEX, "Mutually Exclusive"),
        (MULTISELECT, "Multiple Select"),
    )

    QUESTION_DATA_V1 = 1

    QUESTION_DATA_VERSIONS = (
        QUESTION_DATA_V1,
    )
    IMPACT_FACTORS_SCHEMA = {
        "type": "array",
        "uniqueItems": True,
        "items": {
            "minLength": 1,
            "type": "string",
        },
    }

    QUESTION_DATA_PLAIN_SCHEMA_V1 = {
        "type": "object",
        "required": ["version"],
        "properties": {
            "version": {
                "type": "integer",
            },
            "impact_factors": IMPACT_FACTORS_SCHEMA,
        },
    }

    QUESTION_DATA_MUTEX_SCHEMA_V1 = {
        "type": "object",
        "required": ["version", "options"],
        "properties": {
            "version": {
                "type": "integer",
            },
            "options": {
                "type": "array",
                "uniqueItems": True,
                "minItems": 1,
                "items": {
                    "type": "object",
                    "required": ["sequence", "value", "marks"],
                    "properties": {
                        "sequence": {
                            "type": "integer",
                        },
                        "value": {
                            "minLength": 1,
                            "type": "string",
                        },
                        "marks": {
                            "type": "integer",
                        },
                    },
                }
            },
            "impact_factors": IMPACT_FACTORS_SCHEMA,
        },
    }

    id = AutoField(db_column = 'id', primary_key=True)
    question_txt = CharField(db_column="question_txt", max_length=1024, blank=False)
    max_marks = PositiveIntegerField(db_column='max_marks', blank=False)
    sequence = PositiveIntegerField(db_column='sequence', blank=False)
    solution = ForeignKey(MPSolution, related_name='solutionquestions', db_column='solution_id', blank=False, on_delete=PROTECT)
    question_type = CharField(db_column='question_type', max_length=20, choices=QUESTION_TYPE, default=PLAIN, blank=False)
    question_data = JSONField(db_column='question_data', default=dict, blank=False)
    hide_question = BooleanField(db_column='hide_question', default=False, blank=False, null=False)
    optional_comment_required = BooleanField(db_column='optional_comment_required', default=False, blank=False, null=False)
    
    def __has_unique_key(self, a_list_of_dicts, unique_key):
        values = [d[unique_key] for d in a_list_of_dicts]
        return len(values) == len(set(values))

    def __validate_v1_data(self):

        data = self.question_data

        if self.question_type == self.PLAIN:
            if self.question_data != {}:
                try:
                    validate(self.question_data, self.QUESTION_DATA_PLAIN_SCHEMA_V1)
                except ValidationError as v:
                    raise AppLogicError(v.message) from v
        elif self.question_type == self.MUTEX:
            try:
                validate(self.question_data, self.QUESTION_DATA_MUTEX_SCHEMA_V1)
            except ValidationError as v:
                raise AppLogicError(v.message) from v

            # check for leading and trailing spaces in options
            for option in data["options"]:
                if re.search(r'^\s|\s$', option["value"]):
                    raise AppLogicError("option value contains leading or trailing spaces",option["value"])

            # check for unique sequences
            for option in data["options"]:
                if option["marks"] > self.max_marks:
                    raise AppLogicError("option marks cannot be greater than max marks")

            # check for unique sequences
            if not self.__has_unique_key(data["options"], "sequence"):
                raise AppLogicError("option sequences must be unique")

            # check for unique values
            if not self.__has_unique_key(data["options"], "value"):
                raise AppLogicError("option values must be unique")
        elif self.question_type == self.MULTISELECT:
            try:
                validate(self.question_data, self.QUESTION_DATA_MUTEX_SCHEMA_V1)
            except ValidationError as v:
                raise AppLogicError(v.message) from v

            # check for max marks and option marks
            option_marks = 0
            for option in data["options"]:
                if re.search(r'^\s|\s$', option["value"]):
                    raise AppLogicError("option value contains leading or trailing spaces",option["value"])
                else:
                    option_marks = option_marks + option["marks"]
            if option_marks != self.max_marks:
                raise AppLogicError("addition of option marks should be equal to max marks")

            # check for unique sequences
            if not self.__has_unique_key(data["options"], "sequence"):
                raise AppLogicError("option sequences must be unique")

            # check for unique values
            if not self.__has_unique_key(data["options"], "value"):
                raise AppLogicError("option values must be unique")
        else:
            raise AppLogicError("unknown question_type")

    def __question_data_version(self):
        version = self.question_data.get("version") in self.QUESTION_DATA_VERSIONS
        if self.question_type == MPSolutionQuestion.PLAIN:
            if self.question_data == {}:
                return self.QUESTION_DATA_V1
            else:
                return version
        else:
            return version

    def clean(self):
        question_data_version = self.__question_data_version()
        if question_data_version == self.QUESTION_DATA_V1:
            self.__validate_v1_data()
        else:
            raise AppLogicError("unknown version for question_data")

    def __str__(self):
        return 'Question({}): {}, {}'.format(self.id, self.question_txt, self.max_marks)

    class Meta:
        ordering = ['sequence']
        
class MPSolutionProofTagList(Model):
    id = AutoField(db_column='id', primary_key=True)
    is_active = BooleanField(db_column='is_active', default=True)
    solution = ForeignKey(MPSolution, related_name='solution_proof_tags_list', db_column='solution_id', on_delete=PROTECT)
    proof_tag = ForeignKey(ProofTag, related_name='solution_proof_tags_list', db_column='proof_tag_id', on_delete=PROTECT)
    max_attachment_count = IntegerField(db_column='max_attachment_count', default=2)
    created_at = DateTimeField(db_column='created_at', null=True)

    def save(self, *args, **kwargs):
        ''' On save update timestamp '''
        if not self.id:
            self.created_at = timezone.now()
        return super(MPSolutionProofTagList, self).save(*args, **kwargs)

class MPSolutionOtherDetails(Model):
    id = AutoField(db_column='id', primary_key=True)
    solution = ForeignKey(MPSolution, related_name='other_details', db_column='solution_id', on_delete=PROTECT)
    description = CharField(db_column='description', max_length=16384, blank=False)
    post_approval_description = CharField(db_column='post_approval_description', max_length=16384, blank=False)
    check_points = CharField(db_column='check_points', max_length=16384, blank=True)
    audit_fee = IntegerField(db_column='earnings_per_audit', blank=False, null=False,default=0)
    def __str__(self):
        return 'MPSolutionOtherDetails({}): {}  {}'.format(self.id, self.audit_fee,self.solution)
    
class ManagerProfileInfo(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name' , max_length=50, blank=True,null=True)
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)
    mobile = CharField(db_column='mobile', max_length=15, blank=True,null=True)
    
    def __str__(self):
        return "ManagerProfileInfo: {} {}".format(self.id, self.mobile_number)
