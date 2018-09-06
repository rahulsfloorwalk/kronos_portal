from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AGENCY

from agency.models import Agency, AgencyUser
from audit.models import AuditCycle
from audit_store.models import AuditStore
from questionnaire.models import Section, Question

fake = Faker()


class SectionViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency = AgencyUser.objects.create(agency=self.agency, user=self.agency_user, full_name=fake.name())
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

    def setup_section(self):
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        self.audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=self.audit_cycle)
        self.section = mommy.make(Section, audit_cycle=self.audit_cycle)
        for i in range(5):
            mommy.make(Question, section=self.section)


    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_section_view_returns_section(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_section()
        self.login()

        url = reverse("agency_rest:section_view", kwargs={
            "audit_store_id": self.audit_store.id
        })

        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(response.data))
        self.assertEqual(self.section.name, response.data[0]['name'])
        self.assertEqual(self.section.sequence, response.data[0]['sequence'])
        self.assertEqual(self.section.audit_cycle.id, response.data[0]['audit_cycle'])
        self.assertEqual(5, len(response.data[0]['questions']))
