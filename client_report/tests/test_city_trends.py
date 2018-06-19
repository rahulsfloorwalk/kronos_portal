
from django.test import TestCase

from faker import Faker

from audit.models import AuditCycle
from client_report.service import city_trends

fake = Faker()

class CityTrendsTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_cycle_id = 1
        self.client_user_id = 4
        self.client_admin_id = 5
        self.questionnaire_type_id = 1

    def test_get_performing_cities(self):
        audit_cycle = AuditCycle.objects.get(pk=self.audit_cycle_id)
        city_trend = city_trends.get_performing_cities(audit_cycle)
        self.assertEqual(len(city_trend), 7)
        self.assertTrue(city_trend[0][1]['value'] >= city_trend[1][1]['value'])

    def test_get_performing_cities_by_type_for_clientuser(self):
        performing_cities = city_trends.get_performing_cities_by_type_for_clientuser(self.questionnaire_type_id, 4)
        self.assertEqual(performing_cities['questionnaire_type'], self.questionnaire_type_id)
        self.assertEqual(len(performing_cities['columns']), 3)
        self.assertEqual(len(performing_cities['data']), 7)





