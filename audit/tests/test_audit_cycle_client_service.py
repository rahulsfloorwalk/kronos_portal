from django.contrib.auth.models import Group, User, Permission

from django.test import TestCase

from guardian.shortcuts import assign_perm

from model_mommy import mommy
from model_mommy.recipe import Recipe

from faker import Faker

from registration.models import GROUP_NAME_CLIENT
from audit.models import AuditCycle
from audit.service import audit_cycle_client_service
from questionnaire.models import QuestionnaireType
from client.models import Client, ClientUser
from audit_store.models import AuditStore
from client.models import Store

fake = Faker()

class AuditCycleClientServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.client_group = Group.objects.get(name=GROUP_NAME_CLIENT)
        self.client_admin_permission = Permission.objects.get(codename='clientuser_admin')
        self.client = mommy.make(Client)
        self.client_admin = mommy.make(User, username="clientadmin@foobar.com", email="clientadmin@foobar.com",
                                       groups=[self.client_group],
                                       user_permissions=[self.client_admin_permission])
        self.client_admin_profile = mommy.make(ClientUser, client=self.client, user=self.client_admin)

        self.client_user = mommy.make(User, username="clientuser@foobar.com", email="clientuser@foobar.com",
                                      groups=[self.client_group])
        self.client_user_profile = mommy.make(ClientUser, client=self.client, user=self.client_user)

    def test_find_by_questionnaire_type_for_clientuser(self):
        questionnaire_type = mommy.make(QuestionnaireType, client=self.client)
        audit_cycle_recipe = Recipe(AuditCycle, client=self.client, questionnaire_type=questionnaire_type)

        audit_cycle_recipe.make(status=AuditCycle.PREPARATION)
        audit_cycle_recipe.make(status=AuditCycle.UPCOMING)
        audit_cycle_recipe.make(status=AuditCycle.ACTIVE)
        audit_cycle_recipe.make(status=AuditCycle.REPORT)
        audit_cycle_recipe.make(status=AuditCycle.CLEARING)
        audit_cycle_recipe.make(status=AuditCycle.ARCHIVED)

        audit_cycles = audit_cycle_client_service.find_by_questionnaire_type_for_clientuser(questionnaire_type.id, self.client_admin.id)
        self.assertEqual(2, len(audit_cycles))
        for ac in audit_cycles:
            self.assertIn(ac.status, (AuditCycle.CLEARING, AuditCycle.ARCHIVED))

    def test_find_all_for_clientuser_when_clientuser_is_admin(self):
        questionnaire_type = mommy.make(QuestionnaireType, client=self.client)
        audit_cycle_recipe = Recipe(AuditCycle, client=self.client, questionnaire_type=questionnaire_type)
        audit_store_recipe = Recipe(AuditStore, status=AuditStore.COMPLETED, user__email=lambda: fake.email())

        ac1 = audit_cycle_recipe.make(status=AuditCycle.ACTIVE)
        ac2 = audit_cycle_recipe.make(status=AuditCycle.REPORT)
        ac3 = audit_cycle_recipe.make(status=AuditCycle.ARCHIVED)

        audit_store_recipe.make(audit__audit_cycle=ac1)
        audit_store_recipe.make(audit__audit_cycle=ac2)
        audit_store_recipe.make(audit__audit_cycle=ac3)

        audit_cycles = audit_cycle_client_service.find_all_for_clientuser(self.client_admin.id)
        self.assertEqual(len(audit_cycles), 3)

    def test_find_all_for_clientuser_when_clientuser_is_not_admin(self):
        store = mommy.make(Store, client=self.client)
        questionnaire_type = mommy.make(QuestionnaireType, client=self.client)
        audit_cycle_recipe = Recipe(AuditCycle, client=self.client, questionnaire_type=questionnaire_type)
        audit_store_recipe = Recipe(AuditStore, status=AuditStore.COMPLETED, user__email=lambda: fake.email())

        ac1 = audit_cycle_recipe.make(status=AuditCycle.ACTIVE)
        ac2 = audit_cycle_recipe.make(status=AuditCycle.REPORT)
        ac3 = audit_cycle_recipe.make(status=AuditCycle.ARCHIVED)

        as1 = audit_store_recipe.make(audit__audit_cycle=ac1)
        audit_store_recipe.make(audit__audit_cycle=ac2, audit__store=store)
        audit_store_recipe.make(audit__audit_cycle=ac3)

        audit_cycles = audit_cycle_client_service.find_all_for_clientuser(self.client_user.id)
        self.assertEqual(len(audit_cycles), 0)

        assign_perm("audit_store.clientuser_visible", self.client_user, as1)
        assign_perm("client.clientuser_store_visible", self.client_user, store)

        audit_cycles = audit_cycle_client_service.find_all_for_clientuser(self.client_user.id)
        self.assertEqual(len(audit_cycles), 2)
