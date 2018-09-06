
from django.test import TestCase
from django.contrib.auth.models import User

from audit_store import service_client as client_service
from client.models import Store
from guardian.shortcuts import assign_perm

class AuditStoreClientServiceTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.client_id = 1
        self.store_id = 1
        self.non_admin_client_user_id = 4
        self.admin_client_user_id = 5
        self.client_admin = User.objects.get(pk=self.admin_client_user_id)
        self.store = Store.objects.get(pk=self.store_id)
        self.client_non_admin = User.objects.get(pk=self.non_admin_client_user_id)
        assign_perm('client.clientuser_admin', self.client_admin)

    def test_find_visible_to_client_user_returns_correct_reports(self):
        assign_perm('clientuser_store_visible', self.client_non_admin, self.store)
        audit_stores = client_service.find_visible_to_client_user(self.client_non_admin)
        self.assertEqual(4, len(audit_stores))

    def test_find_visible_to_client_user_returns_all_reports_to_admin_user(self):
        audit_stores = client_service.find_visible_to_client_user(self.client_admin)
        self.assertEqual(34, len(audit_stores))

