from django.utils import timezone
from django.db.models import Model, AutoField, ForeignKey, BooleanField, DateTimeField, IntegerField
from django.db.models import PROTECT
from manager.models import ProofTag
from audit.models import AuditCycle


class AuditCycleProofTagList(Model):
    id = AutoField(db_column='id', primary_key=True)
    is_active = BooleanField(db_column='is_active', default=True)
    audit_cycle = ForeignKey(AuditCycle, related_name='proof_tags_list', db_column='audit_cycle_id', on_delete=PROTECT)
    proof_tag = ForeignKey(ProofTag, related_name='proof_tags_list', db_column='proof_tag_id', on_delete=PROTECT)
    max_attachment_count = IntegerField(db_column='max_attachment_count', default=2)
    created_at = DateTimeField(db_column='created_at', null=True)

    def save(self, *args, **kwargs):
        ''' On save update timestamp '''
        if not self.id:
            self.created_at = timezone.now()
        return super(AuditCycleProofTagList, self).save(*args, **kwargs)
