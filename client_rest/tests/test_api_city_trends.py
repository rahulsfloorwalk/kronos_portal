from django.urls import reverse

from django.contrib.auth.models import User

from rest_framework.test import APITestCase

from client.models import Client

class CityTrendsViewTestCase(APITestCase):
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

    def test_city_trends(self):
        self.login()

        response = self.client.get(reverse('client_rest:dashboard_city_trends', kwargs={
            "questionnaire_type_id": self.questionnaire_type_id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['type'], str(self.questionnaire_type_id))
        self.assertEqual(response.data['questionnaire_type'], str(self.questionnaire_type_id))
        self.assertEqual(len(response.data['columns']), 3)
        self.assertEqual(len(response.data['data']), 7)

    def test_city_trends_xlsx(self):
        self.login()

        response = self.client.get(reverse('client_rest:dashboard_city_trends_xlsx', kwargs={
            "questionnaire_type_id": self.questionnaire_type_id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['type'], str(self.questionnaire_type_id))
        self.assertEqual(response.data['questionnaire_type'], str(self.questionnaire_type_id))
        self.assertEqual(len(response.data['columns']), 3)
        self.assertEqual(len(response.data['data']), 7)

