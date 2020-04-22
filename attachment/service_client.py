
import answer.service.report_section as report_section_service
import audit_store.service_client as audit_store_client_service

import attachment.service as attachment_service

from audit_store.models import AuditStore
from answer.models import ReportSection
from audit.models.audit_cycle import AuditCycle

def find_by_audit_store_for_clientuser(audit_store_id, user):
    audit_store = audit_store_client_service.find_by_id_for_clientuser(audit_store_id, user)
    return attachment_service.find_by_audit_store(audit_store.id)


def find_by_audit_store_and_section_for_client(audit_store_id, section_id, client_id):
    report_section = report_section_service.find_by_audit_store_and_section_for_client(audit_store_id, section_id, client_id)
    return attachment_service.find_by_audit_store_and_section(audit_store_id, report_section.section_id)


def get_attachment_by_proof_tag(store_id, audit_cycle_list, proof_tag_id):
    audit_cycle_list_data = []
    for audit_cycle_id in audit_cycle_list:
        audit_cycle_dict = {}
        audit_cycle_dict['name'] = AuditCycle.objects.get(id=audit_cycle_id).name
        audit_cycle_dict['id'] = audit_cycle_id
        attachment_list = []
        audit_store_list = AuditStore.objects \
            .filter(audit__store__id=store_id, audit__audit_cycle__id=audit_cycle_id,
                    status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED]) \
            .values_list('id', flat=True)
        audit_store_attachment = attachment_service.find_by_audit_store_list(audit_store_list, proof_tag_id)
        report_section_list = ReportSection.objects \
            .filter(audit_store__id__in=audit_store_list,
                    audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED]) \
            .values_list('id', flat=True)
        report_section_attachment = attachment_service.find_by_report_section_list(report_section_list, proof_tag_id)
        for asa in audit_store_attachment:
            asa_dict = {}
            asa_dict['id'] = asa.id
            asa_dict['file_name'] = asa.file_name
            asa_dict['proof_type'] = asa.proof_type
            asa_dict['mime_type'] = asa.mime_type
            asa_dict['direct_url'] = asa.direct_url()
            asa_dict['extra'] = asa.extra()
            attachment_list.append(asa_dict)
        for rsa in report_section_attachment:
            rsa_dict = {}
            rsa_dict['id'] = rsa.id
            rsa_dict['file_name'] = rsa.file_name
            rsa_dict['proof_type'] = rsa.proof_type
            rsa_dict['mime_type'] = rsa.mime_type
            rsa_dict['direct_url'] = rsa.direct_url()
            rsa_dict['extra'] = rsa.extra()
            attachment_list.append(rsa_dict)
        audit_cycle_dict['attachments'] = attachment_list
        audit_cycle_list_data.append(audit_cycle_dict)
    return audit_cycle_list_data
