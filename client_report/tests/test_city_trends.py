
from django.test import TestCase

from faker import Faker

from audit.models import AuditCycle
from client_report.service.city_trends import *

fake = Faker()

class CityTrendsTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_cycle_id = 1
        self.client_user_id = 4
        self.client_admin_id = 5

    def test_get_performing_cities(self):
        audit_cycle = AuditCycle.objects.get(pk=self.audit_cycle_id)
        city_trend = get_performing_cities(audit_cycle)
        self.assertEqual(len(city_trend), 7)
        self.assertTrue(city_trend[0][1].get('value') >= city_trend[1][1].get('value'))

    def test_get_performing_cities_by_type_for_clientuser(self):
        performing_cities = get_performing_cities_by_type_for_clientuser(AuditCycle.WALKIN, 4)
        self.assertEqual(performing_cities.get('type'), AuditCycle.WALKIN)
        self.assertEqual(len(performing_cities.get('columns')), 3)
        self.assertEqual(len(performing_cities.get('data')), 7)





