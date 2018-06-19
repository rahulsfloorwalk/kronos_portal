from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from questionnaire.models import QuestionnaireType
from client.models import Client
from client.models import ClientUser
from registration.models import GROUP_NAME_CLIENT

fake = Faker()

class QuestionnaireTypesByClientViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.client_group = Group.objects.get(name=GROUP_NAME_CLIENT)
        self.client_user = mommy.make(
            User,
            username=self.email,
            email=self.email,
            password=make_password(self.password),
            groups=[self.client_group],
        )
        self.client_object = mommy.make(Client)
        self.client_profile = mommy.make(ClientUser, user=self.client_user, client=self.client_object)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_get_gets_questionnaire_types_for_current_client(self):
        mommy.make(QuestionnaireType, client=self.client_object, _quantity=3)
        mommy.make(QuestionnaireType)
        self.login()

        response = self.client.get(reverse('client_rest:questionnaire_types_by_client_view'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)
        for qt in response.data:
            self.assertEqual(qt["client_id"], self.client_object.id)

