from django.db.transaction import atomic
from kronos.exceptions import AppLogicError, ObjectNotFound
from manager.models import ProofTag
from ..models.proof_tag import SectionProofTag
from audit.service import audit_cycle
from audit.models.audit_cycle import AuditCycle
from audit.models.proof_tag import AuditCycleProofTagList
from questionnaire.models.section import Section


def get_section_proof_tag(section_id):
    audit_cycle_obj = Section.objects.get(pk=section_id).audit_cycle
    proof_tags = ProofTag.objects.filter(is_active=True)
    section_proof_tag_list = []
    for tag in proof_tags:
        section_proof_tag_dict = {}
        is_required = False
        if not SectionProofTag.objects\
                .filter(audit_cycle_proof_tag__proof_tag_id=tag.id, audit_cycle_proof_tag__audit_cycle=audit_cycle_obj)\
                .exclude(section_id=section_id)\
                .exists():
            if SectionProofTag.objects.filter(audit_cycle_proof_tag__proof_tag_id=tag.id,
                                              section_id=section_id).exists():
                is_present_in_section = True
                if SectionProofTag.objects.filter(audit_cycle_proof_tag__proof_tag_id=tag.id, section_id=section_id, is_required = True).exists():
                    is_required = True
            else:
                is_present_in_section = False
            section_proof_tag_dict['id'] = tag.id
            section_proof_tag_dict['name'] = tag.name
            section_proof_tag_dict['is_present_in_section'] = is_present_in_section
            section_proof_tag_dict['is_required'] = is_required
            section_proof_tag_list.append(section_proof_tag_dict)
    section_proof_tag_list = sorted(section_proof_tag_list, key=lambda j: j['name'])
    return sorted(section_proof_tag_list, key=lambda j: j['is_present_in_section'], reverse=True)


@atomic
def save_section_proof_tag(section_id, audit_cycle_id, proof_tag_list, mandatory_proof_tag_list):
    audit_cycle_obj = audit_cycle.find_by_id(audit_cycle_id)
    if audit_cycle_obj.status in [AuditCycle.CLEARING, AuditCycle.ARCHIVED, AuditCycle.REPORT]:
        raise AppLogicError('you cannot change proof tag')
    section_obj = Section.objects.get(pk=section_id)

    # Update audit cycle wise proof tags to in-active
    section_proof_tag_list = SectionProofTag.objects.filter(section_id=section_id)
    AuditCycleProofTagList.objects.filter(id__in = [tag.audit_cycle_proof_tag.id for tag in section_proof_tag_list]).update(is_active = False)
    section_proof_tag_list.delete()

    proof_count = 0
    for i in proof_tag_list:
        is_proof_mandatory = True if i in mandatory_proof_tag_list else False
        if AuditCycleProofTagList.objects.filter(audit_cycle_id=audit_cycle_id, proof_tag_id=i).exists():
            AuditCycleProofTagList.objects.filter(audit_cycle_id=audit_cycle_id, proof_tag_id=i).update(is_active=True)
            audit_cycle_proof_tag_obj = AuditCycleProofTagList.objects.get(audit_cycle_id=audit_cycle_id, proof_tag_id=i)
        else:
            proof_tag_obj = ProofTag.objects.get(pk=i)
            audit_cycle_proof_tag_obj = AuditCycleProofTagList()
            audit_cycle_proof_tag_obj.audit_cycle = audit_cycle_obj
            audit_cycle_proof_tag_obj.proof_tag = proof_tag_obj
            audit_cycle_proof_tag_obj.save()
        proof_count += 1 if is_proof_mandatory else 0
        if not SectionProofTag.objects.filter(audit_cycle_proof_tag_id=audit_cycle_proof_tag_obj.id, section_id=section_id).exists():
            section_proof_tag_obj = SectionProofTag()
            section_proof_tag_obj.audit_cycle_proof_tag = audit_cycle_proof_tag_obj
            section_proof_tag_obj.section = section_obj
            section_proof_tag_obj.is_required = is_proof_mandatory
            section_proof_tag_obj.save()
        else:
            SectionProofTag.objects.filter(audit_cycle_proof_tag_id=audit_cycle_proof_tag_obj.id, section_id=section_id).update(is_required = is_proof_mandatory)
    # Update minimum attachment count for section
    section_obj.minimum_attachment_count = proof_count
    section_obj.save()
    return {"message": "section proof tag added"}


@atomic
def copy_proof_tag_from_to(from_section_id, to_section_id, audit_cycle_id):
    try:
        audit_cycle_obj = audit_cycle.find_by_id(audit_cycle_id)
        from_section = Section.objects.get(pk=from_section_id)
        to_section = Section.objects.get(pk=to_section_id)

        if to_section.section_proof_tag.count() > 0:
            raise AppLogicError("section already has proof tags")

        for section_proof_tag in from_section.section_proof_tag.all():
            proof_tag_obj = ProofTag.objects.get(pk=section_proof_tag.audit_cycle_proof_tag.proof_tag.id)
            if AuditCycleProofTagList.objects.filter(audit_cycle=audit_cycle_obj, proof_tag=proof_tag_obj).exists():
                AuditCycleProofTagList.objects.filter(audit_cycle=audit_cycle_obj, proof_tag=proof_tag_obj)\
                    .update(is_active=True)
                audit_cycle_proof_tag_obj = AuditCycleProofTagList.objects.get(audit_cycle=audit_cycle_obj,
                                                                               proof_tag=proof_tag_obj)
            else:
                audit_cycle_proof_tag_obj = AuditCycleProofTagList()
                audit_cycle_proof_tag_obj.audit_cycle = audit_cycle_obj
                audit_cycle_proof_tag_obj.proof_tag = proof_tag_obj
                audit_cycle_proof_tag_obj.save()

            new_section_proof_tag = SectionProofTag()
            new_section_proof_tag.audit_cycle_proof_tag = audit_cycle_proof_tag_obj
            new_section_proof_tag.section = to_section
            new_section_proof_tag.is_required = section_proof_tag.is_required
            new_section_proof_tag.save()

        return to_section.section_proof_tag.all()
    except (Section.DoesNotExist) as e:
        raise ObjectNotFound from e


def get_section_id_by_audit_cycle_proof_tag_id(audit_cycle_proof_tag_id):
    if SectionProofTag.objects.filter(audit_cycle_proof_tag__id=audit_cycle_proof_tag_id).exists():
        return SectionProofTag.objects.get(audit_cycle_proof_tag__id=audit_cycle_proof_tag_id).section.id
    else:
        return None
