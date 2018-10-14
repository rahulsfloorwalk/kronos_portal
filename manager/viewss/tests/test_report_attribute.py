from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from model_mommy import mommy
from expects import expect, equal, have_length, have_key, have_property

from faker import Faker

from audit.models import AuditCycle
from audit.models import ReportAttribute
from registration.models import GROUP_NAME_MANAGER

fake = Faker()


class ReportAttributeViewGetTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_get_gets_report_attributes(self):
        audit_cycle = mommy.make(AuditCycle)
        mommy.make(ReportAttribute, audit_cycle=audit_cycle, _quantity=3)
        mommy.make(ReportAttribute, audit_cycle=mommy.make(AuditCycle))
        self.login()

        response = self.client.get(reverse('manager:report_attribute_by_audit_cycle_view', kwargs = {
            'audit_cycle_id': audit_cycle.id
        }))
        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_length(3))
        print("RESPONSE", response.data)
        for qt in response.data:
            expect(qt).to(have_key("audit_cycle_id", audit_cycle.id))

class ReportAttributeViewPostTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_creates_new_report_attribute(self):
        audit_cycle = mommy.make(AuditCycle)
        self.login()

        post_data = {
            'label': "MyLabel",
            'attribute_data': {
                "version": 1,
                "options": [
                    {
                        "option_id": "1",
                        "option_label": "label1"
                    },
                    {
                        "option_id": "2",
                        "option_label": "label2"
                    },
                ],
            },
        }

        response = self.client.post(reverse('manager:report_attribute_by_audit_cycle_view', kwargs={
            'audit_cycle_id': audit_cycle.id
        }), post_data, format="json")
        expect(response.status_code).to(equal(200))
        for key, val in post_data.items():
            expect(response.data).to(have_key(key, val))

        expect(response.data).to(have_key('audit_cycle_id', audit_cycle.id))