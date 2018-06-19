from model_mommy import mommy

from django.test import TestCase
from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from questionnaire.service import questionnaire_type_client_service
from questionnaire.models import QuestionnaireType
from auditor.models import ProfileInfo
from client.models import Client

class QuestionnaireTypeClientServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_find_questionnaire_types_by_client_id_returns_questionnaire_types(self):
        client = mommy.make(Client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=client)

        types = questionnaire_type_client_service.find_questionnaire_types_by_client_id(client.id)
        self.assertEqual(4, len(types))
        for qt in types:
            self.assertEqual(client, qt.client)

