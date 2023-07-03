from django.db.models import Model,CASCADE,ManyToManyField,ImageField, CharField,FloatField, AutoField,PositiveIntegerField, ForeignKey, DecimalField, BooleanField, DateTimeField, IntegerField
from django.db.models import PROTECT
from django.utils import timezone

from manager import states
from manager import country

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
    def __str__(self):
        return 'Category({}): {}'.format(self.id, self.name)

class MpInterestArea(Model):
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False)
    def __str__(self):
        return 'InterestArea({}): {}'.format(self.id, self.name)
class MpIndustry(Model):
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False)
    def __str__(self):
        return 'Industry({}): {}'.format(self.id, self.name)

class MPSubcategory(Model):
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False)
    def __str__(self):
        return 'Subcategory({}): {}'.format(self.id, self.name)

class MPSolution(Model):
    id = AutoField(db_column='id', primary_key=True)
    name = CharField(db_column='name', max_length=200, blank=False)
    url_structure = CharField(db_column='url_strucuture',max_length=200,blank=False)
    price = PositiveIntegerField(db_column='price',blank=False,default=0)
    category = ForeignKey(MPCategory, related_name='mpsolutions', db_column='category_id', blank=False, on_delete=PROTECT)
    sub_category = ForeignKey(MPSubcategory, related_name='mpsolutions', db_column='sub_category_id', blank=False, on_delete=PROTECT)
    tax = ForeignKey(MPTax, related_name='mpsolutions', db_column='tax_id', blank=False, on_delete=PROTECT)
    about = CharField(db_column='about', max_length=200, blank=False)
    overview = CharField(db_column='overview', max_length=200, blank=False)
    how_it_work = CharField(db_column='how_it_work', max_length=200, blank=False)
    execution_time = CharField(db_column='execution_time', max_length=200, blank=False)
    short_description = CharField(db_column='short_description', max_length=200, blank=False)
    is_active = BooleanField(db_column='is_active',default=True)
    def __str__(self):
        return 'Solution({}): {}'.format(self.id, self.name)

    