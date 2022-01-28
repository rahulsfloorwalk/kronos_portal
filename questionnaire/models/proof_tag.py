from django.utils import timezone
from django.db.models import Model, AutoField, ForeignKey, OneToOneField, DateTimeField, BooleanField
from django.db.models import PROTECT
from audit.models.proof_tag import AuditCycleProofTagList
from .section import Section


class SectionProofTag(Model):
    id = AutoField(db_column='id', primary_key=True)
    audit_cycle_proof_tag = OneToOneField(AuditCycleProofTagList, related_name='section_proof_tag',
                                          db_column='audit_cycle_proof_tag_id', on_delete=PROTECT)
    section = ForeignKey(Section, related_name='section_proof_tag', db_column='section_id', on_delete=PROTECT)
    is_required = BooleanField(default=False, blank=False)
    created_at = DateTimeField(db_column='created_at', null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        return super(SectionProofTag, self).save(*args, **kwargs)
