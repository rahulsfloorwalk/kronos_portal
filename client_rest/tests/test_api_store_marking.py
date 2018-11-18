
from django.urls import reverse

from django.contrib.auth.models import User

from rest_framework.test import APITestCase

from client.models import Client

class StoreMarkingViewTestCase(APITestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.questionnaire_type_id = 1
        self.store_id = 1
        self.client_id = 1
        self.client_admin_id = 5

        self.email = "demoadmin@floorwalk.in"
        self.password = "demoadmin123#"

        self.client_object = Client.objects.get(pk=self.client_id)
        self.client_user = User.objects.get(pk=self.client_admin_id)
        self.client_profile = self.client_user.clientuser

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_get_scores_graph_for_store(self):
        self.login()

        response = self.client.get(reverse('client_rest:marking_graph_by_store', kwargs={
            "questionnaire_type_id": self.questionnaire_type_id,
            "store_id": self.store_id,
        }))

        self.assertEqual(len(response.data), 4)

    def test_get_scores_for_store(self):
        self.login()

        response = self.client.get(reverse('client_rest:marking_by_store', kwargs={
            "questionnaire_type_id": self.questionnaire_type_id,
            "store_id": self.store_id,
        }))

        self.assertEqual(len(response.data), 2)
        self.assertEqual(len(response.data.get('scores')), 25)
