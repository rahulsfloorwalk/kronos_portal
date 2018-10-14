import random
import string

from audit.models import ReportAttribute


def find_report_attributes_by_audit_cycle_id(audit_cycle_id):
    return ReportAttribute.objects.filter(audit_cycle_id=audit_cycle_id)


def create_report_attribute(audit_cycle_id, label, attribute_data):
    report_attribute = ReportAttribute()
    report_attribute.audit_cycle_id = audit_cycle_id
    report_attribute.label = label
    report_attribute.attribute_data = attribute_data
    report_attribute.json_id = _generate_json_id()
    report_attribute.save()
    return report_attribute


def _generate_json_id():
    possible_set = string.digits + string.ascii_lowercase + string.ascii_uppercase
    k = 10
    return ''.join([random.choice(possible_set) for i in range(k)])
