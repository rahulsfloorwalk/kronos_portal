from django.db.transaction import atomic
from kronos.exceptions import AppLogicError, ObjectNotFound

from manager.models import ProofTag
from audit.models.proof_tag import AuditCycleProofTagList
from audit.service import audit_cycle
from audit.models.audit_cycle import AuditCycle


def get_audit_cycle_proof_tag(audit_cycle_id):
    proof_tag_obj = ProofTag.objects.filter(is_active=True)
    proof_tag_list = []
    for i in proof_tag_obj:
        proof_tag_dict = {}
        if AuditCycleProofTagList.objects.filter(proof_tag_id=i.id, audit_cycle_id=audit_cycle_id, is_active=True).exists():
            is_present_in_audit_cycle = True
        else:
            is_present_in_audit_cycle = False

        proof_tag_dict['id'] = i.id
        proof_tag_dict['name'] = i.name
        proof_tag_dict['is_present_in_audit_cycle'] = is_present_in_audit_cycle
        proof_tag_list.append(proof_tag_dict)
    return sorted(proof_tag_list, key=lambda j: j['name'])


@atomic
def save_proof_tag(audit_cycle_id, proof_tag_list):
    audit_cycle_obj = audit_cycle.find_by_id(audit_cycle_id)
    if audit_cycle_obj.status in [AuditCycle.CLEARING, AuditCycle.ARCHIVED, AuditCycle.REPORT]:
        raise AppLogicError('you cannot change proof tag')
    AuditCycleProofTagList.objects.filter(audit_cycle_id=audit_cycle_id).update(is_active=False)
    for i in proof_tag_list:
        if AuditCycleProofTagList.objects.filter(audit_cycle_id=audit_cycle_id, proof_tag_id=i).exists():
            AuditCycleProofTagList.objects.filter(audit_cycle_id=audit_cycle_id, proof_tag_id=i).update(is_active=True)
        else:
            proof_tag_obj = ProofTag.objects.get(pk=i)
            audit_cycle_proof_tag_obj = AuditCycleProofTagList()
            audit_cycle_proof_tag_obj.audit_cycle = audit_cycle_obj
            audit_cycle_proof_tag_obj.proof_tag = proof_tag_obj
            audit_cycle_proof_tag_obj.save()
    return audit_cycle_obj


def get_audit_cycle_proof_tag_for_attachment(audit_cycle_id):
    return AuditCycleProofTagList.objects.filter(audit_cycle_id=audit_cycle_id, is_active=True).order_by('proof_tag__name')

def find_by_id(id):
    try:
        return AuditCycleProofTagList.objects.get(pk=id)
    except AuditCycleProofTagList.DoesNotExist as e:
        raise ObjectNotFound from e
