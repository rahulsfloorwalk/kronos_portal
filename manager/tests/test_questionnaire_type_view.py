from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from questionnaire.models import QuestionnaireType
from client.models import Client
from auditor.models import ProfileInfo
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

fake = Faker()

class QuestionnaireTypeByClientViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_get_gets_questionnaire_types(self):
        client = mommy.make(Client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=mommy.make(Client))
        self.login()

        response = self.client.get(reverse('manager:questionnaire_type_by_client_view', kwargs = {
            'client_id': client.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

