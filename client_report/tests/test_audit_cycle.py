
from django.test import TestCase

from faker import Faker

from audit.models import AuditCycle
from questionnaire.models import Section
from client_report.service.audit_cycle import get_average_for_section
from client_report.service.audit_cycle import get_section_averages_for_audit_cycle
from client_report.service.audit_cycle import get_audit_cycle_section_averages_for_client

fake = Faker()

class AuditCycleTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.section = Section.objects.get(pk=1)
        self.audit_cycle = AuditCycle.objects.get(pk=1)
        self.questionnaire_type_id = 1
        self.client_id = 1

    def test_get_average_for_section(self):
        section_average = get_average_for_section(self.section)
        self.assertEqual(section_average.get('value'), 36)
        self.assertEqual(section_average.get('color_code'), 1)

    def test_get_section_averages_for_audit_cycle(self):
        section_averages = get_section_averages_for_audit_cycle(self.audit_cycle)
        self.assertEqual(len(section_averages), 5)
        self.assertEqual(section_averages[0].get('average').get('value'), 36)
        self.assertNotEqual(section_averages[1].get('average').get('value'), 36)

    def test_get_audit_cycle_section_averages_for_client(self):
        averages = get_audit_cycle_section_averages_for_client(self.client_id, self.questionnaire_type_id)
        self.assertTrue(len(averages.get('section_master')), len(averages.get('values')[0]))
        self.assertTrue(len(averages.get('audit_cycle_master')), len(averages.get('values')))


