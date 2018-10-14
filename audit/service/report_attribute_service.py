import random
import string

from audit.models import ReportAttribute


def find_report_attributes_by_audit_cycle_id(audit_cycle_id):
    return ReportAttribute.objects.filter(audit_cycle_id=audit_cycle_id)


def create_report_attribute(audit_cycle_id, label, option_labels):
    json_id = _generate_json_id()
    options = convert_attribute_data(json_id, option_labels)

    report_attribute = ReportAttribute()
    report_attribute.audit_cycle_id = audit_cycle_id
    report_attribute.label = label
    report_attribute.json_id = json_id
    report_attribute.attribute_data = {
        "version": ReportAttribute.ATTRIBUTE_DATA_VERSION_1,
        "options": options,
    }
    report_attribute.save()
    return report_attribute


def convert_attribute_data(option_id_prefix, option_labels):
    itr = enumerate(option_labels, start=1)
    return [{"option_id": "{}-{}".format(option_id_prefix, i), "option_label": label} for i, label in itr]


def _generate_json_id():
    possible_set = string.digits + string.ascii_lowercase + string.ascii_uppercase
    k = 10
    return ''.join([random.choice(possible_set) for i in range(k)])
