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


class AuditStoreIdAcknowledgeTestCase(APITestCase):
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
        self.audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                      audit__audit_cycle=self.audit_cycle)


    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_acknowledge_audit_store_sets_status_to_acknowledged(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_audit_store()
        self.login()

        url = reverse("agency_rest:audit_store_id_acknowledge_view", kwargs={
            "audit_store_id": self.audit_store.id
        })

        response = self.client.post(url, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual(AuditStore.ACKNOWLEDGED, response.data['status'])


class AuditStoreIdSubmitTestCase(APITestCase):
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
        self.audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.agency_user,
            audit__audit_cycle=self.audit_cycle,
            report_summary="Summary",
            report_summary_original="Summary"
        )

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_submit_audit_store_sets_status_to_submitted(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_audit_store()
        self.login()

        url = reverse("agency_rest:audit_store_id_submit_view", kwargs={
            "audit_store_id": self.audit_store.id
        })

        response = self.client.post(url, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual(AuditStore.SUBMITTED, response.data['status'])
