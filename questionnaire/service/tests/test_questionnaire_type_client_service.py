from model_mommy import mommy

from django.test import TestCase
from django.contrib.auth.models import User, Group, Permission
from guardian.shortcuts import assign_perm
from faker import Faker
from expects import expect, have_length, have_key

from registration.models import GROUP_NAME_CLIENT
from registration.models import GROUP_NAME_MANAGER
from questionnaire.service import questionnaire_type_client_service
from questionnaire.models import QuestionnaireType
from client.models import Client
from client.models import ClientUser
from client.models import Store
from audit_store.models import AuditStore
from audit.models import AuditCycle

fake = Faker()

class QuestionnaireTypeClientServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.client_group = Group.objects.get(name=GROUP_NAME_CLIENT)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.client_admin_permission = Permission.objects.get(codename='clientuser_admin')
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.client = mommy.make(Client)
        self.client_admin = mommy.make(User, username="clientadmin@foobar.com", email="clientadmin@foobar.com",
                                       groups=[self.client_group],
                                       user_permissions=[self.client_admin_permission])
        self.client_admin_profile = mommy.make(ClientUser, client=self.client, user=self.client_admin)

        self.client_user = mommy.make(User, username="clientuser@foobar.com", email="clientuser@foobar.com",
                                      groups=[self.client_group])
        self.client_user_profile = mommy.make(ClientUser, client=self.client, user=self.client_user)

    def make_and_assign_reports(self):
        qt1 = mommy.make(QuestionnaireType, client=self.client)
        qt2 = mommy.make(QuestionnaireType, client=self.client)
        qt3 = mommy.make(QuestionnaireType, client=self.client)
        mommy.make(QuestionnaireType)

        store1 = mommy.make(Store, client=self.client)
        store2 = mommy.make(Store, client=self.client)
        store3 = mommy.make(Store, client=self.client)

        mommy.make(AuditStore, status=AuditStore.COMPLETED, audit__audit_cycle__client=self.client, audit__audit_cycle__status=AuditCycle.REPORT, audit__audit_cycle__questionnaire_type=qt1, audit__store=store1, user__email=fake.email())
        mommy.make(AuditStore, status=AuditStore.COMPLETED, audit__audit_cycle__client=self.client, audit__audit_cycle__status=AuditCycle.REPORT, audit__audit_cycle__questionnaire_type=qt2, audit__store=store2, user__email=fake.email())
        mommy.make(AuditStore, status=AuditStore.COMPLETED, audit__audit_cycle__client=self.client, audit__audit_cycle__status=AuditCycle.REPORT, audit__audit_cycle__questionnaire_type=qt3, audit__store=store3, user__email=fake.email())

        assign_perm('client.clientuser_store_visible', self.client_user, store1)
        assign_perm('client.clientuser_store_visible', self.client_user, store2)

    def test_find_questionnaire_types_for_client_admin_by_user_returns_questionnaire_types(self):

        self.make_and_assign_reports()

        types = list(questionnaire_type_client_service.find_questionnaire_types_for_client_by_user(self.client_admin))
        expect(types).to(have_length(3))
        for qt in types:
            expect(qt).to(have_key("client_id", self.client.id))

    '''def test_find_questionnaire_types_for_client_non_admin_by_user_returns_only_questionnaire_types_with_assigned_stores(self):

        self.make_and_assign_reports()

        types = list(questionnaire_type_client_service.find_questionnaire_types_for_client_by_user(self.client_user))
        expect(types).to(have_length(2))
        for qt in types:
            expect(qt).to(have_key("client_id", self.client.id))'''

