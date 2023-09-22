from django.utils import timezone
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.fields import GenericRelation
from django.db.transaction import atomic
from django.db.models import Model, QuerySet, CharField, AutoField, EmailField, ForeignKey,DateField, OneToOneField, DateTimeField, BooleanField, DecimalField,IntegerField
from django.contrib.postgres.fields import JSONField
from django.db.models import PROTECT,CASCADE
from django.conf import settings
from manager.models import MPSolution ,MPCategory
from kronos.utils import get_color_code_by_percentage, get_rank_by_percentage, validate_pan
from guardian.shortcuts import assign_perm
from registration.models import GROUP_NAME_CLIENT

# from jsonschema import validate
# from jsonschema.exceptions import ValidationError

# from kronos.exceptions import AppLogicError


class ClientQuerySet(QuerySet):
    def create_client(self, email, client_name, mobile_number, is_auto_signup):
        obj = Client()
        obj.email = email
        obj.name = client_name
        obj.phone = mobile_number
        obj.is_auto_signup = is_auto_signup
        obj.save()
        return obj


class Client(Model):
    objects = ClientQuerySet.as_manager()

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=50, blank=False)
    brand_name = CharField(db_column='brand_name', max_length=50, blank=True)
    email = EmailField(db_column='email', max_length=50, blank=False)
    phone = CharField(db_column='phone', max_length=15, blank=True)
    logo_url = CharField(db_column='logo_url', max_length=512, blank=True)
    brand_logo_url = CharField(db_column='brand_logo_url', max_length=512, blank=True)
    receive_email_notification = BooleanField(db_column='receive_email_notification', default=True)
    address = CharField(db_column='address', max_length=300, blank=True)
    company_website_url = CharField(db_column='company_website_url', max_length=200, blank=True)
    is_auto_signup = BooleanField(db_column='is_auto_signup', default=False)
    payments = GenericRelation('billing.payment', related_query_name='clients')
    is_active = BooleanField('is_active',default=True,blank=False) 
    city = CharField(db_column='city', max_length=300, blank=True)
    state = CharField(db_column='state', max_length=300, blank=True)
    pincode = CharField(db_column='pincode', max_length=300, blank=True)
    gst_in = CharField(db_column='gst_in', max_length=300, blank=True)
    
    def auditor_logo_url(self):
        return self.brand_logo_url or self.logo_url

    def auditor_display_name(self):
        return self.brand_name or self.name

    def __str__(self):
        return 'Client({}): {}'.format(self.id, self.name)

    class Meta:
        ordering = ['name']


class ClientUserQuerySet(QuerySet):
    def find_by_user_id(self, user_id):
        return self.get(user_id=user_id)

    @atomic
    def create_client_user(self, email, password, client, full_name, is_client_admin = False):
        user = User.objects.create_user(email, email=email, password=password)
        user.groups.add(Group.objects.get(name=GROUP_NAME_CLIENT))
        user.save()

        if is_client_admin:
            assign_perm('client.clientuser_admin', user)

        client_user = ClientUser()
        client_user.user = user
        client_user.full_name = full_name
        client_user.client = client
        client_user.save()

        return client_user


class ClientUser(Model):
    objects = ClientUserQuerySet.as_manager()

    id = AutoField(db_column = 'id', primary_key=True)
    full_name = CharField(db_column='full_name', max_length=50, blank=False)
    client = ForeignKey(Client, related_name='users', db_column='client_id', blank=False, on_delete=PROTECT)
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)
    receive_email_notification = BooleanField(db_column='receive_email_notification', default=True)

    def __str__(self):
        return 'ClientUser({}): {}, client: {}'.format(self.id, self.full_name, self.client)

    def is_client_admin(self):
        return self.user.has_perm('client.clientuser_admin')

    class Meta:
        permissions = (
            ('clientuser_admin', 'ClientUser can view all reports, the dashboard and access related reporting APIs'),
        )


class NonClientAdminUserStore(Model):
    id = AutoField(db_column='id', primary_key=True)
    client_user = ForeignKey(ClientUser, related_name='non_admin_user_store_list', db_column='client_user_id', blank=False, on_delete=PROTECT)
    stores = JSONField(db_column='stores', default=dict, blank=False)
    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(NonClientAdminUserStore, self).save(*args, **kwargs)

    def get_store_list(self):
        if "store_list" in self.stores:
            return self.stores['store_list']
        return []


class ClientManager(Model):

    id = AutoField(db_column='id', primary_key=True)
    client = ForeignKey(Client, related_name='managers', db_column='client_id', blank=False, on_delete=PROTECT)
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)
    receive_email_notification = BooleanField(db_column='receive_email_notification', default=True)
    is_active = BooleanField(db_column='is_active', default=True)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(ClientManager, self).save(*args, **kwargs)

    class Meta:
        ordering = ['id']


class ClientTrainer(Model):

    id = AutoField(db_column='id', primary_key=True)
    client = ForeignKey(Client, related_name='trainers', db_column='client_id', blank=False, on_delete=PROTECT)
    user = ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)
    receive_email_notification = BooleanField(db_column='receive_email_notification', default=True)
    is_active = BooleanField(db_column='is_active', default=True)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(ClientTrainer, self).save(*args, **kwargs)

    class Meta:
        ordering = ['id']


class Store(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    code = CharField(db_column='code', max_length=20, blank=True, null=True, default=None)
    type = CharField(db_column='type', max_length=20, blank=True, default='')
    priority = CharField(db_column='priority', max_length=50, blank=True, default='')
    name = CharField(db_column='name', max_length=500, blank=False)
    address = CharField(db_column='address', max_length=1024, blank=False)
    location = ForeignKey('manager.Location', db_column='location_id', blank=True, null=True, on_delete=PROTECT)
    city = ForeignKey('manager.City', db_column='city_id', null=True, on_delete=PROTECT)
    client = ForeignKey(Client, related_name='stores', db_column='client_id', on_delete=PROTECT)
    phone = CharField(db_column='phone', max_length=100, blank=True)
    map_location_link = CharField(db_column='map_location_link', max_length=1024, blank=True, default='')
    pincode = CharField(db_column='pincode', max_length=20, blank=True, null=True, default=None)
    extra_data = JSONField(db_column='extra_data', default=dict, blank=False)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(Store, self).save(*args, **kwargs)

    def get_store_address(self):
        return self.address

    def get_total_percentage(self):
        percentage = 0
        count = 0
        total_percentage = None
        for audit in self.audits.filter():
            audit_stores = audit.audit_stores.presentable()
            for audit_store in audit_stores:
                percentage += audit_store.audit_store_percentage
                count += 1
            if percentage is not 0:
                total_percentage = round(percentage / count)
        if total_percentage is None:
            return {"score": None, "color": get_color_code_by_percentage(None)}
        return {"score": total_percentage, "color": get_color_code_by_percentage(total_percentage)}

    def get_store_rank(self):
        total_percentage = self.get_total_percentage()
        return get_rank_by_percentage(total_percentage["score"])

    def __str__(self):
        return 'Store({}): {}, client: {}'.format(self.id, self.name, self.client)

    class Meta:
        unique_together = ("client", "code")
        permissions = (
            ('clientuser_store_visible', 'ClientUser can view all AuditStore instances for this Store'),
        )


class BankInfo(Model):
    id = AutoField(db_column= 'id', primary_key=True)
    gstin = CharField(db_column='gstin', max_length=20, blank=True)
    pan_number = CharField(db_column='pan_number', max_length=10, blank=True)

    client = OneToOneField(Client, related_name='client_bank_info', db_column='client_id', on_delete=PROTECT)
    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(BankInfo, self).save(*args, **kwargs)

    def is_pan_card_valid(self):
        return bool(validate_pan(self.pan_number))


class Quotation(Model):

    PAID = 'PAID'
    PENDING = 'PENDING'
    COMPLETED = 'COMPLETED'

    STATUS_CHOICES = (
        (PAID, "Paid"),
        (PENDING, "Pending"),
        (COMPLETED, "Completed"),
    )

    _UNCOMPLETE_STATUS = (PENDING, PAID)

    # QUOTATION_DATA_SCHEMA = {
    #     "type": "object",
    #     "required": ["industry", "audit_type", "audit_category", "audit_locations", "quotation_fee", "gst_amount", "gst", "discount", "payable_amount"],
    #     "properties": {
    #         "industry": {
    #             "type": "object",
    #             "required": ["id", "name"],
    #             "properties": {
    #                 "id": {
    #                     "type": "integer"
    #                 },
    #             }
    #         },
    #         "audit_category": {
    #             "type": "object",
    #             "required": ["id", "name"],
    #             "properties": {
    #                 "id": {
    #                     "type": "integer"
    #                 },
    #             }
    #         },
    #         "audit_type": {
    #             "type": "object",
    #             "required": ["id", "name"],
    #             "properties": {
    #                 "id": {
    #                     "type": "integer"
    #                 },
    #             }
    #         },
    #         "audit_locations": {
    #             "type": "array",
    #             "uniqueItems": True,
    #             "minItems": 1,
    #             "items": {
    #                 "type": "object",
    #                 "required": ["id", "name", "tier", "audit_count", "audit_fee"],
    #                 "properties": {
    #                     "id": {
    #                         "type": "integer",
    #                     },
    #                     "name": {
    #                         "type": "string",
    #                     },
    #                     "tier": {
    #                         "type": "integer"
    #                     },
    #                     "audit_count": {
    #                         "type": "integer",
    #                     },
    #                     "audit_fee": {
    #                         "type": "integer",
    #                     },
    #                 },
    #             }
    #         },
    #         "quotation_fee": {
    #             "type": "integer",
    #         },
    #         "gst_amount": {
    #             "type": "integer",
    #         },
    #         "gst": {
    #             "type": "string",
    #         },
    #         "discount": {
    #             "type": "integer",
    #         },
    #         "payable_amount": {
    #             "type": "integer",
    #         },
    #     },
    # }

    id = AutoField(db_column= 'id', primary_key=True)
    quotation_data = JSONField(db_column='quotation_data', default=dict, blank=False)
    status = CharField(db_column='status', max_length=10, choices=STATUS_CHOICES)
    industry = ForeignKey('questionnaire.Industry', related_name='quotation', db_column='industry_id', on_delete=PROTECT)
    problem_statement = ForeignKey('questionnaire.ProblemStatement', related_name='quotation', db_column='problem_statement_id', on_delete=PROTECT)
    sample_questionnaire_type = ForeignKey('questionnaire.SampleQuestionnaireType', related_name='quotation', db_column='sample_questionnaire_type_id', on_delete=PROTECT)
    amount = DecimalField(db_column='amount', max_digits=10, decimal_places=2)
    payable_amount = DecimalField(db_column='payable_amount', max_digits=10, decimal_places=2)
    gst = DecimalField(db_column='gst', max_digits=3, decimal_places=1)
    discount = DecimalField(db_column='discount', max_digits=3, decimal_places=1)
    client = ForeignKey(Client, related_name='quotation', db_column='client_id', on_delete=PROTECT)
    payment = GenericRelation('billing.payment', related_query_name='quotations')
    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    @property
    def gst_amount(self):
        gst = int(settings.CLIENT_QUOTATION_GST) if settings.CLIENT_QUOTATION_GST else 0
        return (self.amount * gst) / 100


    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        # self.clean()
        return super(Quotation, self).save(*args, **kwargs)

    # def __validate_data(self):
    #     if self.quotation_data:
    #         try:
    #             validate(self.quotation_data, self.QUOTATION_DATA_SCHEMA)
    #         except ValidationError as v:
    #             raise AppLogicError(v.message) from v
    #     else:
    #         raise AppLogicError('Invalid quotation')

    # def clean(self):
    #     self.__validate_data()
    #     return super(Quotation, self).clean()


class ClientForEcomm(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    first_name = CharField(db_column='first_name', max_length=50, blank=True)
    last_name = CharField(db_column='last_name', max_length=50, blank=True)
    email = EmailField(db_column='email', max_length=50, blank=False)
    phone_number = CharField(db_column='phone_number', max_length=15, blank=True)
    company = CharField(db_column='company', max_length=50, blank=True)
    password = CharField(db_column='password', max_length=50, blank=True)
    encrypt_password = CharField(db_column='encrypt_password',max_length=128, blank=True)
    address = CharField(db_column='address',max_length=50, blank=True)
    city = CharField(db_column='city',max_length=50, blank=True)
    state = CharField(db_column='state',max_length=50, blank=True)
    pincode = CharField(db_column='pincode',max_length=50, blank=True)
    gst_in = CharField(db_column='gst_in',max_length=50, blank=True)
    created_at = DateTimeField(db_column="created_at", null=True)
    def __str__(self):
        return 'ClientforEcomm({}): {}'.format(self.id,self.email)

    class Meta:
        ordering = ['email']
        
class MPClientProfileInfo(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)
    first_name = CharField(db_column='first_name', max_length=150, blank=False)
    last_name = CharField(db_column='last_name', max_length=150, blank=True,default='')
    mobile_number = CharField(db_column='mobile_number', max_length=15, blank=False)
    company_name = CharField(db_column='company_name', max_length=15, blank=False)
    gst = CharField(db_column='gst', max_length=150, blank=True,default='')
    address = CharField(db_column='address', max_length=150, blank=True,default='')

    def __str__(self):
        return "ClientProfileInfo: {} {}".format(self.id, self.first_name)
       
    # class Meta: 
    #     permissions = (
    #         ('add_mpclientprofileinfo', 'Can add mp client profile info'),
    #         ('change_mpclientprofileinfo', 'Can change mp client profile info'),
    #     )
class MPOrder(Model):
    COMPLETE = 'COMPLETE'
    DRAFT = 'DRAFT'
    ACTIVE = 'ACTIVE'
    STATUS = (
        (COMPLETE, "Complete"),
        (DRAFT, "Draft"),
        (ACTIVE, "Active"),
    )
    PAYMENT_SUCCESS = 'SUCCESS'
    PAYMENT_FAILED = 'FAILED'
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_SUCCESS, 'Payment Successful'),
        (PAYMENT_FAILED, 'Payment Failed'),
    ]
    id = AutoField(db_column='id', primary_key=True)
    no_of_response = IntegerField(db_column='no_of_response',blank=True,default=1,null=True)
    solution = ForeignKey(MPSolution, related_name='mporders', db_column='solution_id', on_delete=PROTECT,blank=False)
    describe = CharField(db_column='describe',blank=True,max_length=16384,null=True)
    user = ForeignKey(User, on_delete=PROTECT,db_column='user_id')
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    payment_status = CharField(db_column='payment_status', max_length=20, choices=PAYMENT_STATUS_CHOICES, blank=True, null=True)
    alignment_factors = JSONField(db_column='alignment_factors', default=list, blank=True,null=True)
    store = JSONField(db_column='stores', default=list, blank=True,null=True)
    attachments = GenericRelation('attachment.Attachment', related_query_name='orders')
    razorpay_payment_id = CharField(max_length=100, blank=True, null=True)
    razorpay_signature = CharField(max_length=100, blank=True, null=True)
    price = IntegerField(db_column='price',default=0,blank=True,null=True)
    category = ForeignKey(MPCategory, related_name='mporders', db_column='category_id', on_delete=PROTECT,blank=False)
    created_at = DateTimeField(db_column="created_at", null=True, blank=True)
    modified_at = DateTimeField(db_column="modified_at", null=True, blank=True)

    def __str__(self):
        return 'MPOrder({}): Solution{} '.format(self.id, self.solution)
    
    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        return super(MPOrder, self).save(*args, **kwargs)

    # class Meta: 
    #     permissions = (
    #         ('add_mporder', 'Can add mp order'),
    #         ('change_mporder', 'Can change mp order'),   
    #     )
class Transaction(Model):
    id = AutoField(primary_key=True)
    order = ForeignKey(MPOrder, on_delete=CASCADE,db_column='order_id')
    payment_id = CharField(max_length=100,db_column='payment_id')
    signature = CharField(max_length=200,db_column='signature')
    payment_success_date = DateTimeField(null=True, blank=True)

    
    def __str__(self):
        return 'Transaction({}): orderID{}'.format(self.id,self.order) 