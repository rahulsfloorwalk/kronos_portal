
from django.test import TestCase

from faker import Faker

from audit.models import AuditCycle
from client.service.client_user import find_clientuser_by_user_id
from client_report.service.ears_xlsx import get_report_data_for_client_user

fake = Faker()

class EarsXlsxTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_store_id = 1
        self.client_user_id = 5

    def test_get_report_data_for_client_user(self):
        client_user = find_clientuser_by_user_id(self.client_user_id)
        ears_data = get_report_data_for_client_user(self.audit_store_id, client_user)
        self.assertEqual(len(ears_data.keys()), 9)






