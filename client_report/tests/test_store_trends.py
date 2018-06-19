
from django.test import TestCase

from faker import Faker

from audit.models import AuditCycle
from client_report.service import store_trends

fake = Faker()

class StoreTrendsTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_cycle_id = 1
        self.client_admin_id = 5
        self.questionnaire_type_id = 1

    def test_get_performing_stores(self):
        audit_cycle = AuditCycle.objects.get(pk=self.audit_cycle_id)
        store_trend = store_trends.get_performing_stores(audit_cycle)
        self.assertEqual(len(store_trend), 11)
        self.assertTrue(store_trend[0][1]['value'] >= store_trend[1][1]['value'])

    def test_get_performing_cities_by_type_for_clientuser(self):
        performing_stores = store_trends.get_performing_stores_by_type_for_clientuser(self.questionnaire_type_id, self.client_admin_id)
        self.assertEqual(performing_stores['type'], self.questionnaire_type_id)
        self.assertEqual(len(performing_stores['columns']), 3)
        self.assertEqual(len(performing_stores['data']), 11)

