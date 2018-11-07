from datetime import date
from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from expects import expect, equal, have_key
from model_mommy import mommy

from faker import Faker

from audit.models import AuditCycle, Audit
from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR, GROUP_NAME_AGENCY
from auditor.models import ProfileInfo, AuditApplication

fake = Faker()

class AuditApplicationApproveViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_approves_an_existing_application(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        sample_date = date(2018, 9, 5)
        application = mommy.make(AuditApplication, audit=audit, profileinfo=self.auditor_profile, audit_date=sample_date, status=AuditApplication.APPLIED)

        self.login()
        post_data = {
            "audit_date": sample_date.strftime("%Y-%m-%d"),
            "earnings_per_audit": 3000,
            "reimbursement": 4000,
        }

        response = self.client.post(reverse('manager:audit_application_approve_view', kwargs={
            "application_id": application.id,
        }), post_data, format="json")

        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("audit_date", post_data["audit_date"]))
        expect(response.data).to(have_key("status", AuditApplication.APPROVED))

