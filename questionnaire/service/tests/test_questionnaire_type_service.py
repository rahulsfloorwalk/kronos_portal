from model_mommy import mommy

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound, AppLogicError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from questionnaire.service import questionnaire_type_service
from questionnaire.models import QuestionnaireType
from auditor.models import ProfileInfo
from audit.models import AuditCycle

class QuestionnaireTypeServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def create_instance(self):
        return mommy.make(QuestionnaireType)

    def test_find_questionnaire_type_by_id_returns_questionnaire_type(self):
        expected_qt = self.create_instance()
        actual_qt = questionnaire_type_service.find_questionnaire_type_by_id(expected_qt.id)
        self.assertEqual(expected_qt, actual_qt)

    def test_find_questionnaire_type_by_id_raises_when_object_does_not_exist(self):
        with self.assertRaises(ObjectNotFound):
            questionnaire_type_service.find_questionnaire_type_by_id(5)

    def test_delete_questionnaire_type_by_id_deletes_questionnaire_type(self):
        expected_qt = self.create_instance()
        questionnaire_type_service.delete_questionnaire_type_by_id(expected_qt.id)
        self.assertFalse(QuestionnaireType.objects.filter(pk=expected_qt.id).exists())

    def test_delete_questionnaire_type_by_id_raises_when_it_is_in_use(self):
        expected_qt = self.create_instance()
        mommy.make(AuditCycle, questionnaire_type=expected_qt)
        with self.assertRaisesRegex(AppLogicError, "Questionnaire Type is in use"):
            questionnaire_type_service.delete_questionnaire_type_by_id(expected_qt.id)
