from django.db.utils import IntegrityError
from django.db.transaction import atomic

from kronos.exceptions import AppLogicError, ObjectNotFound

from questionnaire.models import Section
from audit.models import AuditCycle
from audit_store.models import AuditStore
from auditor.models import ProfileInfo
import audit_store.service_client as audit_store_client_service
from audit_store import service_agency as audit_store_agency_service
from answer.models import ReportSection

from questionnaire.service import question as question_service
from answer.models import Answer

from questionnaire.service import section_proof_tag as proof_tag_service
from django.contrib.auth.models import User
from questionnaire.models import Question

import logging
__logger = logging.getLogger(__name__)

def save(section):
    Section.save(section)
    return section

def delete_section_by_id(section_id):
    try:
        s = Section.objects.get(pk=section_id)
        s.delete()
    except Section.DoesNotExist as e:
        raise ObjectNotFound from e
    except IntegrityError as e:
        raise AppLogicError("cannot delete section that has questions or comments on it") from e

def find_by_audit_cycle_and_id(audit_cycle_id, section_id):
    try:
        return Section.objects.get(audit_cycle_id=audit_cycle_id, pk=section_id)
    except Section.DoesNotExist as e:
        raise ObjectNotFound from e

def find_by_audit_cycle_mandatory_proof(audit_cycle_id):
    try:
        return Section.objects.filter(audit_cycle_id=audit_cycle_id)
    except Exception as e:
        raise Exception("Error retrieving Sections for audit_cycle_id {}: {}".format(audit_cycle_id, e))

def find_section_by_id(section_id):
    try:
        return Section.objects.get(pk=section_id)
    except Section.DoesNotExist as e:
        raise ObjectNotFound from e

def get_for_auditor(audit_store_id, profile_info_id):
    try:
        audit_store = AuditStore.objects.get(pk=audit_store_id)
        profile_info = ProfileInfo.objects.get(pk=profile_info_id)
    except (AuditStore.DoesNotExist, ProfileInfo.DoesNotExist) as e:
        raise ObjectNotFound() from e

    if audit_store.user_id == profile_info.user_id:
        return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)
    else:
        raise ObjectNotFound()


def find_by_audit_store_for_agency(audit_store_id, user_id):
    audit_store = audit_store_agency_service.find_by_id_for_agency_user(audit_store_id, user_id)
    return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)


def find_by_audit_store_for_clientuser(audit_store_id, user):
    audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, user)
    return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)

def get_sections_by_audit_cycle(audit_cycle_id, user):
    try:
        user = User.objects.get(id=user)
        audit_cycle = AuditCycle.objects.get(id=audit_cycle_id)
    except (User.DoesNotExist, AuditCycle.DoesNotExist):
        return []
    return Section.objects.filter(audit_cycle_id=audit_cycle.id).only("id", "name").values("id", "name")

def get_questions_by_section(section_id, user):   
    try:
        user = User.objects.get(id=user)
        section = Section.objects.get(id=section_id)
    except (User.DoesNotExist, Section.DoesNotExist):
        return []
    return  Question.objects.filter(section=section).values("id", "question_txt")

def get_question_by_id(question_ids, user, store_ids=None): 
    try:
        user = User.objects.get(id=user)
    except User.DoesNotExist:
        raise ValueError("Unauthorized user")  
    
    questions = Question.objects.filter(id__in=question_ids)
    if not questions.exists():
        return []
    
    answers = Answer.objects.filter(
        question__in=questions,
        audit_store__status__in=['ACCEPTED', 'COMPLETED']
    )
    if store_ids:
        answers = answers.filter(audit_store__audit__store__id__in=store_ids)
    return answers

# def get_sections_by_audit_cycle(audit_cycle_id, user):
#     audit_cycle = audit_store_client_service.find_audit_cycle_by_id_for_clientuser(audit_cycle_id, user)
#     return  Section.objects.filter(audit_cycle_id=audit_cycle.id).only("id", "name").values("id", "name")

def find_by_audit_store_for_moderator(audit_store_id, user_id):
    from audit_store.service_moderator import find_by_id_for_moderator
    audit_store = find_by_id_for_moderator(audit_store_id, user_id)
    return Section.objects.filter(audit_cycle_id=audit_store.audit.audit_cycle.id)

def find_by_audit_cycle(audit_cycle_id):
    return Section.objects.filter(audit_cycle_id=audit_cycle_id)

@atomic
def copy_sections_from_to(from_audit_cycle_id, to_audit_cycle_id):
    try:
        from_audit_cycle = AuditCycle.objects.get(pk=from_audit_cycle_id)
        to_audit_cycle = AuditCycle.objects.get(pk=to_audit_cycle_id)

        if to_audit_cycle.sections.count() > 0:
            raise AppLogicError("audit cycle already has sections")

        for section in from_audit_cycle.sections.all():
            new_section = Section()
            new_section.name = section.name
            new_section.sequence = section.sequence
            # new_section.minimum_attachment_count = section.minimum_attachment_count
            new_section.audit_cycle = to_audit_cycle
            new_section.hide_comment = section.hide_comment
            new_section.save()
            question_service.copy_questions_from_to(section.id, new_section.id)
            proof_tag_service.copy_proof_tag_from_to(section.id, new_section.id, to_audit_cycle_id)
            proof_tags = proof_tag_service.get_section_proof_tag(new_section.id)
            new_section.minimum_attachment_count = sum(tag['is_required'] is True for tag in proof_tags)
            new_section.save()
        return to_audit_cycle.sections.all()

    except (AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e


def get_store_performance_data(percentage, questionnaire_id):
    __logger.info("store_performance_searched")
    audit_cycles_list = AuditStore.objects \
        .presentable() \
        .filter(
            audit__audit_cycle__questionnaire_type_id=questionnaire_id
        ) \
        .distinct('audit__audit_cycle_id') \
        .values_list('audit__audit_cycle_id')
    sections = ReportSection.objects \
        .filter(report_section_percentage__gt=0, section__audit_cycle_id__in=audit_cycles_list) \
        .order_by('id') \
        .values('section__id', 'section__name')
    check_section_list = []
    section_list = []
    for section in sections:
        if section['section__name'] not in check_section_list:
            section_list.append({'id': section['section__id'], 'name': section['section__name']})
            check_section_list.append(section['section__name'])
    section_list.append({'id': '0', 'name': 'Total Score'})
    data_list = []
    key = 1
    audit_cycle_obj = AuditStore.objects \
        .presentable() \
        .filter(
            audit__audit_cycle__questionnaire_type_id=questionnaire_id
        ) \
        .distinct('audit__audit_cycle_id') \
        .order_by('-audit__audit_cycle_id') \
        .values(
            'audit__audit_cycle__id',
            'audit__audit_cycle__name'
        )[:10]
    for audit_cycle in audit_cycle_obj:
        data_dict = {}
        section_count_list = []
        for section in section_list:
            if section['name'] == "Total Score":
                if AuditStore.objects.filter(status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                             audit__audit_cycle__id=audit_cycle['audit__audit_cycle__id'],
                                             audit_store_percentage__lt=int(percentage)).exists():
                    check_audit_list = []
                    count = 0
                    audit_store_obj = AuditStore.objects.filter(
                        status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                        audit__audit_cycle__id=audit_cycle['audit__audit_cycle__id'],
                        audit_store_percentage__lt=int(percentage)) \
                        .prefetch_related(
                        'audit'
                    )
                    for audit_store in audit_store_obj:
                        audit_id = audit_store.audit.id
                        if audit_id not in check_audit_list:
                            count += 1
                            check_audit_list.append(audit_id)
                    section_count_list.append({"count": count, "key": key, "section_name": section['name'],
                                               "section_id": section['id'],
                                               "audit_cycle_id": audit_cycle['audit__audit_cycle__id']})
                    key += 1
                else:
                    section_count_list.append({"count": 0, "key": key})
                    key += 1
            else:
                if ReportSection.objects.filter(section__name=section['name'], not_applicable=False,
                                                audit_store__audit__audit_cycle__id=audit_cycle['audit__audit_cycle__id'],
                                                audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                                                report_section_percentage__lt=int(percentage)).exists():
                    check_audit_list = []
                    count = 0
                    report_obj = ReportSection.objects \
                        .filter(
                            section__name=section['name'], not_applicable=False,
                            audit_store__audit__audit_cycle__id=audit_cycle['audit__audit_cycle__id'],
                            audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                            report_section_percentage__lt=int(percentage)
                        ) \
                        .prefetch_related(
                            'audit_store__audit'
                        )
                    for report in report_obj:
                        audit_id = report.audit_store.audit.id
                        if audit_id not in check_audit_list:
                            count += 1
                            check_audit_list.append(audit_id)
                    section_count_list.append({"count": count, "key": key, "section_name": section['name'],
                                               "section_id": section['id'],
                                               "audit_cycle_id": audit_cycle['audit__audit_cycle__id']})
                    key += 1
                else:
                    section_count_list.append({"count": 0, "key": key})
                    key += 1

            data_dict = {"audit_cycle": audit_cycle['audit__audit_cycle__name'],
                         "audit_cycle_id": audit_cycle['audit__audit_cycle__id'],
                         "section": section_count_list}
        data_list.append(data_dict)
    return {"section_count": data_list, "sections": section_list, "percentage": percentage}


def get_store_performance_store_list(audit_cycle_id, section_id, percentage):
    if int(section_id) == 0:
        section_name = "Total Score"
        audit_store_obj = AuditStore.objects.filter(
            status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
            audit__audit_cycle__id=audit_cycle_id,
            audit_store_percentage__lt=int(percentage)) \
            .prefetch_related(
            'audit',
            'audit__store'
        )
        store_list = []
        check_audit_list = []
        for audit_store in audit_store_obj:
            audit_id = audit_store.audit.id
            if audit_id not in check_audit_list:
                store_obj = audit_store.audit.store
                store_dict = {"id": store_obj.id, "name": store_obj.name,
                              "code": store_obj.code, "city": store_obj.city.name}
                store_list.append(store_dict)
                check_audit_list.append(audit_id)
    else:
        section_name = Section.objects.get(id=section_id).name
        report_obj = ReportSection.objects \
            .filter(
                section__name=section_name, not_applicable=False,
                audit_store__audit__audit_cycle__id=audit_cycle_id,
                audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                report_section_percentage__lt=int(percentage)) \
            .prefetch_related(
                'audit_store__audit',
                'audit_store__audit__store'
            )
        store_list = []
        check_audit_list = []
        for report in report_obj:
            audit_id = report.audit_store.audit.id
            if audit_id not in check_audit_list:
                store_obj = report.audit_store.audit.store
                store_dict = {"id": store_obj.id, "name": store_obj.name,
                              "code": store_obj.code, "city": store_obj.city.name}
                store_list.append(store_dict)
                check_audit_list.append(audit_id)
    audit_cycle_name = AuditCycle.objects.get(id=audit_cycle_id).name
    return {"store_list": store_list, "section_name": section_name, "audit_cycle_name": audit_cycle_name}
