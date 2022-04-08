from django.contrib.auth.models import Group, User

from django.test import TestCase

from model_mommy import mommy
from faker import Faker
from client_rest_v1.services.questionnaire_type import find_questionnaire_type_by_id, find_questionnaire_type_by_client

from registration.models import GROUP_NAME_CLIENT
from questionnaire.models import QuestionnaireType
from client.models import Client, ClientUser

fake = Faker()

class QuestionnaireTypeServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.client_group = Group.objects.get(name=GROUP_NAME_CLIENT)
        self.client = mommy.make(Client)
        self.user = mommy.make(User, username="clientadmin@foobar.com", email="clientadmin@foobar.com", groups=[self.client_group])

    def test_questionnaire_type_by_client_user(self):
        mommy.make(ClientUser, user = self.user, client = self.client)
        mommy.make(QuestionnaireType, 2, client = self.client)
        queryset = find_questionnaire_type_by_client(self.client.id)
        self.assertEqual(queryset.count(), 2)

    def test_questionnaire_type_by_id(self):
        mommy.make(QuestionnaireType, 1, client = self.client, pk = 1)
        queryset = find_questionnaire_type_by_id(1)
        self.assertEqual(queryset.id, 1)    