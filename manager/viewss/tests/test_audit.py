from datetime import date
from django.urls import reverse

from django.contrib.auth.models import User, Group

from expects import expect, equal, have_key
from model_mommy import mommy

from faker import Faker

from .utils import ManagerAPITestCase
from audit.models import AuditCycle, Audit
from registration.models import GROUP_NAME_AGENCY
from agency.models import AgencyUser

fake = Faker()

class AuditFiatAssignViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditFiatAssignViewTestCase, self).setUp()
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                      groups=[self.agency_group])
        self.agency_profile = mommy.make(AgencyUser, user=self.agency_user)
        self.login()

    def test_post_assigns_a_new_report_to_an_auditor(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        sample_date = date(2018, 9, 5)

        post_data = {
            "audit_date": sample_date.strftime("%Y-%m-%d"),
            "earnings_per_audit": 3000,
            "reimbursement": 4000,
            "email": self.create_auditor().email,
        }

        response = self.client.post(reverse('manager:audit_fiat_assign_view', kwargs={
            "audit_id": audit.id,
        }), post_data, format="json")

        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("audit_date", post_data["audit_date"]))
        expect(response.data).to(have_key("earnings_per_audit", 3000))
        expect(response.data).to(have_key("reimbursement", 4000))
        expect(response.data["user"]).to(have_key("email", post_data["email"]))

    def test_post_assigns_a_new_report_to_an_agency(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        sample_date = date(2018, 9, 5)

        post_data = {
            "audit_date": sample_date.strftime("%Y-%m-%d"),
            "earnings_per_audit": 3000,
            "reimbursement": 4000,
            "email": self.agency_user.email,
        }

        response = self.client.post(reverse('manager:audit_fiat_assign_view', kwargs={
            "audit_id": audit.id,
        }), post_data, format="json")

        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("audit_date", post_data["audit_date"]))
        expect(response.data).to(have_key("earnings_per_audit", 3000))
        expect(response.data).to(have_key("reimbursement", 4000))
        expect(response.data["user"]).to(have_key("email", post_data["email"]))

