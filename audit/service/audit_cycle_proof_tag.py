from django.db.transaction import atomic
from kronos.exceptions import AppLogicError, ObjectNotFound

from manager.models import ProofTag
from audit.models.proof_tag import AuditCycleProofTagList
from audit.service import audit_cycle
from audit.models.audit_cycle import AuditCycle
from audit.models.audit import Audit
from questionnaire.models.proof_tag import SectionProofTag
from questionnaire.service import questionnaire_type_client_service
from client.models import Client

def get_audit_cycle_proof_tag(audit_cycle_id):
    proof_tag_obj = ProofTag.objects.filter(is_active=True)
    proof_tag_list = []
    for i in proof_tag_obj:
        proof_tag_name = i.name
        proof_tag_dict = {}
        is_required_proof = False
        if AuditCycleProofTagList.objects.filter(proof_tag_id=i.id, audit_cycle_id=audit_cycle_id, is_active=True).exists():
            audit_cycle_proof_tag_obj = AuditCycleProofTagList.objects.get(proof_tag_id=i.id,
                                                                           audit_cycle_id=audit_cycle_id,
                                                                           is_active=True)
            if SectionProofTag.objects.filter(audit_cycle_proof_tag=audit_cycle_proof_tag_obj).exists():
                section_obj = SectionProofTag.objects.get(audit_cycle_proof_tag=audit_cycle_proof_tag_obj)
                proof_tag_name = "{} ({})".format(i.name, section_obj.section.name)
                is_required_proof = section_obj.is_required
            is_present_in_audit_cycle = True
        else:
            is_present_in_audit_cycle = False

        proof_tag_dict['id'] = i.id
        proof_tag_dict['name'] = proof_tag_name
        proof_tag_dict['is_present_in_audit_cycle'] = is_present_in_audit_cycle
        proof_tag_dict['is_required'] = is_required_proof
        proof_tag_list.append(proof_tag_dict)
        proof_tag_list = sorted(proof_tag_list, key=lambda j: j['name'])
    return sorted(proof_tag_list, key=lambda j: j['is_present_in_audit_cycle'], reverse=True)

def get_client_by_proof_tag_id(proof_tag_id):
    obj = AuditCycleProofTagList.objects.filter(proof_tag_id=proof_tag_id)
    res=[]
    audit_cycle_ids=[]
    if obj:
        if obj.count()>1:
            for i in obj:
                audit_cycle_ids.append(i.audit_cycle_id)
        else:
            ob = AuditCycleProofTagList.objects.get(proof_tag_id=proof_tag_id)
            audit_cycle_ids.append(ob.audit_cycle_id)
    if len(audit_cycle_ids)>1:
        client= Client.objects.filter(id__in=audit_cycle_ids)
        if client:
            if client.count()>1:
                for i in client:
                    res.append({'id':i.id,'name':i.name,'brand_name':i.brand_name})
            else:
                client= Client.objects.get(id__in=audit_cycle_ids)
                res.append({'id':client.id,'name':client.name,'brand_name':client.brand_name})
    else:
        client= Client.objects.filter(id = audit_cycle_ids[0])
        if client:
            if client.count()>1:
                for i in client:
                    res.append({'id':i.id,'name':i.name,'brand_name':i.brand_name})
            else:
                client= Client.objects.get(id = audit_cycle_ids[0])
                res.append({'id':client.id,'name':client.name,'brand_name':client.brand_name})
    return res


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
    audit_cycle_proof_tag_obj = AuditCycleProofTagList.objects.filter(audit_cycle_id=audit_cycle_id, is_active=True).order_by('proof_tag__name')

    proof_tag_list = []
    for audit_cycle_proof_tag in audit_cycle_proof_tag_obj:
        proof_tag_dict = {}
        if SectionProofTag.objects.filter(audit_cycle_proof_tag=audit_cycle_proof_tag).exists():
            section_proof_tag_obj = SectionProofTag.objects.get(audit_cycle_proof_tag=audit_cycle_proof_tag)
            proof_tag_name = "{}".format(section_proof_tag_obj.audit_cycle_proof_tag.proof_tag.name)
            section_id = section_proof_tag_obj.section.id
            is_required = section_proof_tag_obj.is_required
            max_attachment_count = section_proof_tag_obj.max_attachment_count
        else:
            proof_tag_name = "{}".format(audit_cycle_proof_tag.proof_tag.name)
            section_id = 0
            is_required = False
            max_attachment_count = audit_cycle_proof_tag.max_attachment_count

        proof_tag_dict['id'] = audit_cycle_proof_tag.id
        proof_tag_dict['proof_tag'] = proof_tag_name
        proof_tag_dict['section_id'] = section_id
        proof_tag_dict['is_required'] = is_required
        proof_tag_dict['max_attachment_count'] = max_attachment_count
        proof_tag_list.append(proof_tag_dict)
    return sorted(proof_tag_list, key=lambda j: j['proof_tag'])



def find_by_id(id):
    try:
        return AuditCycleProofTagList.objects.get(pk=id)
    except AuditCycleProofTagList.DoesNotExist as e:
        raise ObjectNotFound from e


def find_proof_tags_by_store(store_id, questionnaire_type_id):
    if questionnaire_type_id is None:
        questionnaire_type = questionnaire_type_client_service.find_questionnaire_types_for_proof_comparison(store_id)[0]
        questionnaire_type_id = questionnaire_type['id']

    proof_tag = AuditCycleProofTagList.objects \
        .filter(audit_cycle__questionnaire_type__id=questionnaire_type_id, is_active=True) \
        .distinct('proof_tag__name')
    return proof_tag


def get_audit_cycle_list_by_store(store_id, questionnaire_type_id):
    audit_audit_cycle_list = Audit.objects \
        .filter(store__id=store_id, audit_cycle__status__in=[AuditCycle.CLEARING, AuditCycle.ARCHIVED]) \
        .order_by('-audit_cycle__id').values_list('audit_cycle__id', flat=True)
    audit_cycle_list = AuditCycleProofTagList.objects \
        .filter(audit_cycle__id__in=audit_audit_cycle_list, is_active=True,
                audit_cycle__questionnaire_type__id=questionnaire_type_id) \
        .distinct('audit_cycle__id') \
        .order_by('-audit_cycle__id') \
        .values_list('audit_cycle__id', flat=True)
    if len(audit_cycle_list) >= 3:
        return audit_cycle_list[0:3]
    else:
        return audit_cycle_list


def get_master_proof_tag_id_from_audit_cycle_proof_tag(proof_id):
    return AuditCycleProofTagList.objects.get(id=proof_id).proof_tag.id


def get_status_of_audit_cycle_proof_tag_by_audit_cycle_id(audit_cycle_id):
    return AuditCycleProofTagList.objects.filter(audit_cycle_id=audit_cycle_id, is_active=True).exists()


@atomic
def copy_proof_tag_from_to_audit_cycle(from_audit_cycle, to_audit_cycle):
    from_audit_cycle_proof_tag_list = from_audit_cycle.proof_tags_list.all()
    for from_proof_tag in from_audit_cycle_proof_tag_list:
        if AuditCycleProofTagList.objects\
                .filter(audit_cycle=to_audit_cycle, proof_tag=from_proof_tag.proof_tag).exists():
            AuditCycleProofTagList.objects\
                .filter(audit_cycle=to_audit_cycle, proof_tag=from_proof_tag.proof_tag)\
                .update(is_active=True)
        else:
            audit_cycle_proof_tag_obj = AuditCycleProofTagList()
            audit_cycle_proof_tag_obj.audit_cycle = to_audit_cycle
            audit_cycle_proof_tag_obj.proof_tag = from_proof_tag.proof_tag
            audit_cycle_proof_tag_obj.save()
