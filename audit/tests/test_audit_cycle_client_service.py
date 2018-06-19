from django.contrib.auth.models import Group, User

from django.test import TestCase

from model_mommy import mommy
from model_mommy.recipe import Recipe

from faker import Faker

from registration.models import GROUP_NAME_CLIENT
from audit.models import AuditCycle
from audit.service import audit_cycle_client_service
from questionnaire.models import QuestionnaireType
from client.models import Client, ClientUser

fake = Faker()

class AuditCycleClientServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.client_group = Group.objects.get(name=GROUP_NAME_CLIENT)
        self.client = mommy.make(Client)
        self.client_user = mommy.make(User, username="clientuser@foobar.com", email="clientuser@foobar.com",
                                      groups=[self.client_group])
        self.client_profile = mommy.make(ClientUser, client=self.client, user=self.client_user)

    def test_find_by_questionnaire_type_for_clientuser(self):
        questionnaire_type = mommy.make(QuestionnaireType, client=self.client)
        audit_cycle_recipe = Recipe(AuditCycle, client=self.client, questionnaire_type=questionnaire_type)

        audit_cycle_recipe.make(status=AuditCycle.PREPARATION)
        audit_cycle_recipe.make(status=AuditCycle.UPCOMING)
        audit_cycle_recipe.make(status=AuditCycle.ACTIVE)
        audit_cycle_recipe.make(status=AuditCycle.REPORT)
        audit_cycle_recipe.make(status=AuditCycle.ARCHIVED)

        audit_cycles = audit_cycle_client_service.find_by_questionnaire_type_for_clientuser(questionnaire_type.id, self.client_user.id)
        self.assertEqual(len(audit_cycles), 3)
        for ac in audit_cycles:
            self.assertIn(ac.status, (AuditCycle.ACTIVE, AuditCycle.REPORT, AuditCycle.ARCHIVED))
