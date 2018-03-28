from django.test import TestCase

from faker import Faker
from audit_store.service import assign_audit_store_to_client_user
from client.service.client_user import find_clientuser_by_user_id
from client_report.service.ears_xlsx import get_report_data_for_client_user

fake = Faker()


class EarsXlsxTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_store_id = 1
        self.user_id = 5
        assign_audit_store_to_client_user(self.audit_store_id, self.user_id)

    def test_get_report_data_for_client(self):
        client_user = find_clientuser_by_user_id(self.user_id)
        ears_data = get_report_data_for_client_user(self.audit_store_id, client_user)
        key_set = {'store_address', 'client_name', 'logo_url', 'title', 'sections', 'audit_date', 'marks_percentage', 'subtitle', 'store_name'}
        self.assertEqual(key_set, set(ears_data.keys()))
        self.assertEqual(len(ears_data['sections']), 4)






