from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AGENCY

from agency.models import Agency, AgencyUser
from audit.models import AuditCycle
from audit_store.models import AuditStore

fake = Faker()

class AuditStoreIdViewTestCase(APITestCase):
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

    def setup_audit_store(self):
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        self.audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user, audit__audit_cycle=self.audit_cycle)

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_get_retrieves_the_assigned_audit_stores(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_audit_store()
        self.login()

        response = self.client.get(reverse("agency_rest:audit_store_id_view", kwargs={
            "audit_store_id": self.audit_store.id
        }))
        self.assertEqual(200, response.status_code)
        self.assertEqual(self.audit_store.id, response.data["id"])

    def test_get_404s_when_audit_cycle_is_archived(self):
        self.setup_agency()
        self.setup_agency_user()
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ARCHIVED)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACCEPTED, user=self.agency_user, audit__audit_cycle=audit_cycle)
        self.login()

        response = self.client.get(reverse("agency_rest:audit_store_id_view", kwargs={
            "audit_store_id": audit_store.id
        }))
        self.assertEqual(404, response.status_code)
