from django.utils import timezone
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, ForeignKey, PositiveIntegerField, BooleanField, DateTimeField, DecimalField
from django.db.models import PROTECT
from auditor.models import AuditApplication
from client.models import Quotation
from manager.models import City
import re
import audit_store
from django.core.exceptions import ValidationError


class Audit(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    count = PositiveIntegerField(db_column='count', blank=False, default=1)
    audit_date = DateField(db_column='audit_date', blank=True, null=True)
    earnings_per_audit = IntegerField(db_column='earnings_per_audit', blank=True, null=True)
    reimbursement = IntegerField(db_column='reimbursement', blank=True, null=True)
    store = ForeignKey('client.Store', related_name='audits', db_column='store_id', on_delete=PROTECT)
    audit_cycle = ForeignKey('audit.AuditCycle', related_name='audits', db_column='audit_cycle_id', on_delete=PROTECT)
    post_approval_description = CharField(db_column='post_approval_description', max_length=4096, blank=True)
    hidden = BooleanField(db_column='hidden', default=False)
    client_trainer = ForeignKey('client.ClientTrainer',db_column='client_trainer_id',related_name='audits',blank=True,null=True,on_delete=PROTECT)

    created_at = DateTimeField(db_column="created_at", null=True)
    modified_at = DateTimeField(db_column="modified_at", null=True)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created_at = timezone.now()
        self.modified_at = timezone.now()
        # self.clean() 
        # Check for existing audits with the same store and audit_cycle before creating
        existing_audit = Audit.objects.filter(store=self.store, audit_cycle=self.audit_cycle).first()
        
        if existing_audit:
            # If client_id is 345 or 346, allow duplicate and create a new record with a new ID
            if self.store.client.id in [345, 346]:
                # Create a new audit with a new ID and allow duplicate combination
                return super(Audit, self).save(*args, **kwargs)
            # else:
            #     # If client_id is not 345 or 346, prevent duplicate and raise validation error
            #     raise ValidationError("An audit already exists for this store and audit cycle.")
        
        # No existing audit, proceed to create a new one
        return super(Audit, self).save(*args, **kwargs)
    

    # def clean(self):
    #     """Custom validation to skip unique_together check for client_id 345 or 346."""
    #     client_id = self.store.client.id if self.store else None

        # If client_id is not 345 or 346, enforce the unique_together constraint
        # if client_id not in [345, 346]:
        #     # Check if an audit with the same store and audit_cycle already exists
        #     if Audit.objects.filter(store=self.store, audit_cycle=self.audit_cycle).exists():
        #         raise ValidationError("An audit already exists for this store and audit cycle.")

    def application_count(self):
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'applications' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched applications
            return len([a for a in self.applications.all() if a.status != AuditApplication.NOT_APPLIED])
        else:
            return self.applications.exclude(status=AuditApplication.NOT_APPLIED).count()

    def valid_report_count(self):
        valid_status = (
            audit_store.models.AuditStore.COMPLETED,
            audit_store.models.AuditStore.ACCEPTED,
            audit_store.models.AuditStore.ASSIGNED,
            audit_store.models.AuditStore.ACKNOWLEDGED,
            audit_store.models.AuditStore.PM_REVIEW,
            audit_store.models.AuditStore.SUBMITTED,
        )
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'audit_stores' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched reports
            return len([a for a in self.audit_stores.all() if a.status in valid_status])
        else:
            return self.audit_stores.filter(status__in=valid_status).count()

    def report_count(self):
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'audit_stores' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched reports
            return len(self.audit_stores.all())
        else:
            return self.audit_stores.count()

    def get_pincode_audit(self):
        address = self.store.get_store_address()
        pincode = self.store.pincode
        if not pincode:
            regex = "\d{6}"
            match = re.findall(regex, address)
            if match:
                pincode = match[0]
            else:
                pincode = None
        return pincode

    def __str__(self):
        return "Audit({}): audit_cycle: {}, store: {}, count: {}".format(self.id, self.audit_cycle, self.store, self.count)

    # class Meta:
    #     unique_together = (("store", "audit_cycle"))


class AuditLocation(Model):
    quotation = ForeignKey(Quotation, related_name='audit_locations', db_column='quotation_id', on_delete=PROTECT)
    city = ForeignKey(City, db_column='city_id', on_delete=PROTECT)
    count = PositiveIntegerField(db_column='count')
    audit_fee = DecimalField(db_column='audit_fee', max_digits=6, decimal_places=1)