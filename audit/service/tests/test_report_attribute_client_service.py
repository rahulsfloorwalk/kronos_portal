from django.contrib.auth.models import Group, User, Permission

from django.test import TestCase

from guardian.shortcuts import assign_perm

from model_mommy import mommy
from model_mommy.recipe import Recipe
from expects import expect, have_length, be_empty, contain_only, equal
from faker import Faker

from kronos.exceptions import ObjectNotFound
from registration.models import GROUP_NAME_CLIENT
from audit.models import AuditCycle, ReportAttribute
from audit.service import report_attribute_client_service
from questionnaire.models import QuestionnaireType
from client.models import Client, ClientUser
from audit_store.models import AuditStore
from client.models import Store

fake = Faker()

class ReportAttributeClientServiceTestCase(TestCase):
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

    def test_find_report_attributes_by_audit_cycle_id_for_client(self):
        audit_cycle = mommy.make(AuditCycle, client=self.client)
        expected_report_attributes = mommy.make(ReportAttribute, audit_cycle=audit_cycle, _quantity=3)
        actual_report_attributes = report_attribute_client_service.find_report_attributes_by_audit_cycle_id_for_client(audit_cycle.id, self.client_user.id)
        expect(list(actual_report_attributes.all())).to(contain_only(*expected_report_attributes))
