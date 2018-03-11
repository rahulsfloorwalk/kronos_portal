
from django.test import TestCase

from faker import Faker

from client_report.service.audit_section import *

fake = Faker()

class AuditSectionTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_cycle_id = 1
        self.store_id = 1
        self.client_id = 1
        self.incorrect_city_id = 1
        self.city_id = 650

    def test_get_store_section_aggregation_for_manager(self):
        aggregate = get_store_section_aggregation_for_manager(self.audit_cycle_id, self.store_id)
        self.assertEqual(len(aggregate), 5)

    def test_get_store_section_aggregation_for_client(self):
        aggregate = get_store_section_aggregation_for_client(self.audit_cycle_id, self.store_id, self.client_id)
        self.assertEqual(len(aggregate), 5)

    def test_get_city_section_aggregation_for_manager(self):
        aggregate = get_city_section_aggregation_for_manager(self.audit_cycle_id, self.city_id)
        blank_aggregate = get_city_section_aggregation_for_manager(self.audit_cycle_id, self.incorrect_city_id)
        self.assertEqual(len(aggregate), 5)
        self.assertFalse(blank_aggregate)

    def test_get_city_section_aggregation_for_client(self):
        aggregate = get_city_section_aggregation_for_client(self.audit_cycle_id, self.city_id, self.client_id)
        blank_aggregate = get_city_section_aggregation_for_client(self.audit_cycle_id, self.incorrect_city_id, self.client_id)
        self.assertEqual(len(aggregate), 5)
        self.assertFalse(blank_aggregate)


