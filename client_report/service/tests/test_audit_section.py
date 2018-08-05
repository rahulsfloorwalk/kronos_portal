from django.contrib.auth.models import User

from django.test import TestCase

from guardian.shortcuts import assign_perm

from faker import Faker

from client_report.service.audit_section import get_audit_store_aggregation_for_client

fake = Faker()

class AuditSectionTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_cycle_id = 1
        self.store_id = 1
        self.client_id = 1
        self.incorrect_city_id = 1
        self.city_id = 650
        self.client_user_id = 4

        self.client_admin_id = 5
        self.client_admin = User.objects.get(pk=self.client_admin_id)
        assign_perm('client.clientuser_admin', self.client_admin)

    def test_get_audit_store_aggregation_for_client(self):
        aggregate = get_audit_store_aggregation_for_client(self.audit_cycle_id, self.client_admin_id)
        self.assertEqual(len(aggregate), 11)

