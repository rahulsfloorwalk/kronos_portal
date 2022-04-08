from django.db.models import Model, CharField, IntegerField, AutoField, DateField, ForeignKey
from django.db.models import PROTECT, F, Sum
from django.db.models.fields import BooleanField
from django.core.validators import MinValueValidator
from django.contrib.postgres.fields import JSONField

import audit_store


class AuditCycle(Model):

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

    PREPARATION = 'PREPARATION'
    UPCOMING = 'UPCOMING'
    ACTIVE = 'ACTIVE'
    REPORT = 'REPORT'
    CLEARING = 'CLEARING'
    ARCHIVED = 'ARCHIVED'
    STATUS = (
        (PREPARATION, 'Preparation'),
        (UPCOMING, 'Upcoming'),
        (ACTIVE, 'Active'),
        (REPORT, 'Report'),
        (CLEARING, "Clearing"),
        (ARCHIVED, 'Archived'),
    )

    ALL_STATUSES = [s[0] for s in STATUS]
    TRENDABLE_STATUSES = [CLEARING, ARCHIVED]
    LIVE_REPORTING_STATUSES = [ACTIVE, REPORT, CLEARING, ARCHIVED]
    MODERATOR_VISIBLE_STATUSES = [UPCOMING, ACTIVE, REPORT, CLEARING]
    MODERATOR_MODIFIABLE_STATUSES = [ACTIVE, REPORT]
    AUDITOR_VISIBLE_STATUSES = [UPCOMING, ACTIVE, REPORT, CLEARING]
    AGENCY_VISIBLE_STATUSES = [UPCOMING, ACTIVE, REPORT, CLEARING]
    MANAGER_DASHBOARD_STATUSES = [UPCOMING, ACTIVE, REPORT, CLEARING]

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column='name', max_length=50, blank=False)
    type = CharField(db_column='type', max_length=20, choices=TYPES, blank=False)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False)
    start_date = DateField(db_column='start_date')
    end_date = DateField(db_column='end_date')
    planned_audit = IntegerField(db_column='planned_audit', blank=False, default=0, validators=[MinValueValidator(0)])
    earnings_per_audit = IntegerField(db_column='earnings_per_audit', blank=True, null=True)
    revenue_per_audit = IntegerField(db_column='revenue_per_audit', blank=True, null=True)
    charge_per_audit = IntegerField(db_column='charge_per_audit', blank=False, default=0)
    system_cost = IntegerField(db_column='system_cost', blank=False, default=0)
    reimbursement = IntegerField(db_column='reimbursement', blank=True, null=True, validators=[MinValueValidator(0)])
    audit_auto_approve = BooleanField(db_column='audit_auto_approve', default = False)
    description = CharField(db_column='description', max_length=16384, blank=False)
    client = ForeignKey('client.Client', related_name='audits', db_column='client_id', on_delete=PROTECT)
    post_approval_description = CharField(db_column='post_approval_description', max_length=16384, blank=True)
    check_points = CharField(db_column='check_points', max_length=16384, blank=True)
    questionnaire_type = ForeignKey('questionnaire.QuestionnaireType', db_column='questionnaire_type_id', null=True, on_delete=PROTECT)
    support_page_link = CharField(db_column='support_page_link', max_length=200, blank=True)
    audit_alignment_factors = JSONField(db_column='audit_alignment_factors', default=list, blank=False)
    created_by_client = BooleanField(db_column="created_by_client", default=False)

    class Meta:
        permissions = (
            ('moderator_manage', 'Moderator can manage this Audit Cycle'),
        )

    def max_marks(self):
        return sum(s.max_marks() for s in self.sections.all())

    def audit_count(self):
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'audits' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched questions
            return sum(a.count for a in self.audits.all())
        else:
            return self.audits.aggregate(audit_count=Sum(F('count')))["audit_count"]

    def completed_audit_count(self):
        return audit_store.models.AuditStore.objects.filter(
            audit__audit_cycle_id=self.id,
            status__in=[audit_store.models.AuditStore.COMPLETED, audit_store.models.AuditStore.ACCEPTED]
        ).count()

    def completed_percentage(self):
        audit_count = self.audit_count()
        if audit_count is 0:
            return audit_count
        else:
            return self.completed_audit_count() * 100 / audit_count

    def get_total_percentage(self):
        percentage = 0
        count = 0
        total_percentage = None
        for audit in self.audits.filter():
            audit_stores = audit.audit_stores.presentable()
            for audit_store_obj in audit_stores:
                percentage += audit_store_obj.audit_store_percentage
                count += 1
            if percentage is not 0:
                total_percentage = round(percentage / count)
        if total_percentage is None:
            return None
        return total_percentage

    def __str__(self):
        return "AuditCycle({}): {}, client: {}".format(self.id, self.name, self.client)
