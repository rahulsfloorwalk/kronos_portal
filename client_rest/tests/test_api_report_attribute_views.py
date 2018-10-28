from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase
from model_mommy import mommy
from expects import expect, have_property, have_length, have_key
from faker import Faker

from registration.models import GROUP_NAME_CLIENT
from audit.models import AuditCycle, ReportAttribute
from client.models import Client, ClientUser

fake = Faker()

class ReportAttributeByAuditCycleViewTestCase(APITestCase):
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

    def test_get_gets_report_attributes_by_audit_cycle_for_client(self):
        self.login()
        audit_cycle = mommy.make(AuditCycle, client=self.client_object)
        expected_report_attributes = mommy.make(ReportAttribute, audit_cycle=audit_cycle, _quantity=4)

        response = self.client.get(reverse('client_rest:report_attributes_by_audit_cycle_view', kwargs={
            "audit_cycle_id": audit_cycle.id,
        }))
        expect(response).to(have_property("status_code", 200))
        expect(response.data).to(have_length(len(expected_report_attributes)))
        for ra in response.data:
            expect(ra).to(have_key("audit_cycle_id", audit_cycle.id))