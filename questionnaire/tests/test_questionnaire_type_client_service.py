from model_mommy import mommy

from django.test import TestCase
from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_CLIENT
from registration.models import GROUP_NAME_MANAGER
from questionnaire.service import questionnaire_type_client_service
from questionnaire.models import QuestionnaireType
from client.models import Client
from client.models import ClientUser

class QuestionnaireTypeClientServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.client_group = Group.objects.get(name=GROUP_NAME_CLIENT)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.client = mommy.make(Client)
        self.client_user = mommy.make(User, username="clientuser@foobar.com", email="clientuser@foobar.com",
                                      groups=[self.client_group])
        self.client_profile = mommy.make(ClientUser, client=self.client, user=self.client_user)

    def test_find_questionnaire_types_for_client_by_user_returns_questionnaire_types(self):
        mommy.make(QuestionnaireType, client=self.client, _quantity=4)
        mommy.make(QuestionnaireType)

        types = questionnaire_type_client_service.find_questionnaire_types_for_client_by_user(self.client_user)
        self.assertEqual(len(types), 4)
        for qt in types:
            self.assertEqual(qt.client, self.client)

