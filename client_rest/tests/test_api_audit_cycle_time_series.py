'''from django.urls import reverse

from django.contrib.auth.models import User

from rest_framework.test import APITestCase

from client.models import Client

class AuditCycleTimeSeriesViewTestCase(APITestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.client_id = 1
        self.audit_cycle_id = 1
        self.client_admin_id = 5
        self.questionnaire_type_id = 1
        self.email = "demoadmin@floorwalk.in"
        self.password = "demoadmin123#"

        self.client_object = Client.objects.get(pk=self.client_id)
        self.client_user = User.objects.get(pk=self.client_admin_id)
        self.client_profile = self.client_user.clientuser

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_audit_cycle_time_series(self):
        self.login()

        response = self.client.get(reverse('client_rest:audit_cycle_time_series', kwargs={
            "questionnaire_type_id": self.questionnaire_type_id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data.get('section_master')), 5)
        self.assertTrue(len(response.data.get('values')[0]), 5)
        self.assertTrue(len(response.data.get('audit_cycle_master')), 3)
        self.assertTrue(len(response.data.get('values')), 3)

    def test_audit_cycle_time_series_xlsx(self):
        self.login()

        response = self.client.get(reverse('client_rest:audit_cycle_time_series_xlsx', kwargs={
            "questionnaire_type_id": self.questionnaire_type_id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data.get('section_master')), 5)
        self.assertTrue(len(response.data.get('values')[0]), 5)
        self.assertTrue(len(response.data.get('audit_cycle_master')), 3)
        self.assertTrue(len(response.data.get('values')), 3)'''
