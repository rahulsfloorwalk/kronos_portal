
from django.test import TestCase
from guardian.shortcuts import assign_perm
from django.contrib.auth.models import User
from faker import Faker

from audit.models import AuditCycle
from questionnaire.models import Section
from client.models import Store
from client_report.service.audit_cycle import get_average_for_report_sections
from client_report.service.audit_cycle import get_averages_for_sections_for_client_user
from client_report.service.audit_cycle import get_audit_cycle_section_averages_for_client
from client_report.service.audit_cycle import get_audit_cycle_section_averages

fake = Faker()


class AuditCycleTestCase(TestCase):

    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.section = Section.objects.get(pk=1)
        self.audit_cycle = AuditCycle.objects.get(pk=1)
        self.store_id = 1
        self.questionnaire_type_id = 1
        self.client_id = 1
        self.non_admin_client_user_id = 4
        self.admin_client_user_id = 5
        self.store = Store.objects.get(pk=self.store_id)
        self.client_admin = User.objects.get(pk=self.admin_client_user_id)
        self.client_non_admin = User.objects.get(pk=self.non_admin_client_user_id)
        assign_perm('client.clientuser_admin', self.client_admin)

    def test_get_audit_cycle_section_averages_for_client_admin(self):
        averages = get_audit_cycle_section_averages_for_client(self.client_admin, self.questionnaire_type_id)
        self.assertTrue(len(averages.get('section_master')), 5)
        self.assertTrue(len(averages.get('values')[0]), 5)
        self.assertTrue(len(averages.get('audit_cycle_master')), 3)
        self.assertTrue(len(averages.get('values')), 3)

    '''def test_get_audit_cycle_section_averages_for_client_non_admin(self):
        averages = get_audit_cycle_section_averages_for_client(self.client_id, self.questionnaire_type_id, self.non_admin_client_user_id)
        self.assertTrue(len(averages.get('section_master')), 5)
        self.assertTrue(len(averages.get('values')[0]), 5)
        self.assertTrue(len(averages.get('audit_cycle_master')), 3)
        self.assertTrue(len(averages.get('values')), 3)'''

    def test_get_audit_cycle_section_averages_for_client_admin_user(self):
        qs = AuditCycle.objects.filter(client__id=self.client_id).filter(
            questionnaire_type_id=self.questionnaire_type_id).order_by('end_date')
        averages = get_audit_cycle_section_averages(qs, self.admin_client_user_id)
        self.assertEqual('Audit Cycle Summary', averages['title'])
        self.assertEqual(3, len(averages['audit_cycle_master']))
        self.assertEqual(5, len(averages['section_master']))

    '''def test_get_audit_cycle_section_averages_for_client_non_admin_user(self):
        qs = AuditCycle.objects.filter(client__id=self.client_id).filter(
            questionnaire_type_id=self.questionnaire_type_id).order_by('end_date')
        averages = get_audit_cycle_section_averages(qs, self.non_admin_client_user_id)
        self.assertEqual('Audit Cycle Summary', averages['title'])
        self.assertEqual(3, len(averages['audit_cycle_master']))
        self.assertEqual(5, len(averages['section_master']))'''

    def test_get_averages_for_sections_for_client_admin_user(self):
        section_averages = get_averages_for_sections_for_client_user(self.audit_cycle.sections.all(), self.admin_client_user_id)
        self.assertEqual(len(section_averages), 5)
        self.assertEqual(section_averages[0].get('average').get('value'), 36)

    '''def test_get_averages_for_sections_for_client_non_admin_user(self):
        assign_perm('clientuser_store_visible', self.client_non_admin, self.store)
        section_averages = get_averages_for_sections_for_client_user(self.audit_cycle.sections.all(), self.non_admin_client_user_id)
        self.assertEqual(len(section_averages), 5)
        # self.assertEqual(section_averages[0].get('average').get('value'), 20)
        self.assertEqual(section_averages[0].get('average').get('value'), 36)'''

    def test_get_average_for_report_sections(self):
        report_section_average = get_average_for_report_sections(self.section.report_sections.all())
        self.assertEqual(1, report_section_average['color_code'])
        self.assertEqual(36, report_section_average['value'])


