from client.models import Store
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
            "audit_count": 2,
        }

        responses = self.client.post(reverse('manager:audit_fiat_assign_view', kwargs={
            "audit_id": audit.id,
        }), post_data, format="json")

        expect(responses.status_code).to(equal(200))
        for response in responses.data:
            expect(response).to(have_key("audit_date", post_data["audit_date"]))
            expect(response).to(have_key("earnings_per_audit", 3000))
            expect(response).to(have_key("reimbursement", 4000))
            expect(response["user"]).to(have_key("email", post_data["email"]))

    def test_post_assigns_a_new_report_to_an_agency(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        sample_date = date(2018, 9, 5)

        post_data = {
            "audit_date": sample_date.strftime("%Y-%m-%d"),
            "earnings_per_audit": 3000,
            "reimbursement": 4000,
            "email": self.agency_user.email,
            "audit_count": 2,
        }

        responses = self.client.post(reverse('manager:audit_fiat_assign_view', kwargs={
            "audit_id": audit.id,
        }), post_data, format="json")

        expect(responses.status_code).to(equal(200))
        for response in responses.data:
            expect(response).to(have_key("audit_date", post_data["audit_date"]))
            expect(response).to(have_key("earnings_per_audit", 3000))
            expect(response).to(have_key("reimbursement", 4000))
            expect(response["user"]).to(have_key("email", post_data["email"]))


class RegionWiseAuditStoreTestCase(ManagerAPITestCase):
    def setUp(self):
        super().setUp()
        self.audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        self.client_store_list = self.create_stores()
        self.login()

    def create_stores(self):
        return mommy.make(Store, city__state="IN-MH", client = self.audit_cycle.client, _quantity=3)

    def test_state_wise_audit(self):

        post_data = {
            "audit_cycle": self.audit_cycle.id,
            "audit_region": "state",
            "country": "IN",
            "state": "IN-MH",
            "earnings_per_audit": 800,
            "reimbursement": 400,
            "count": 5,
            "post_approval_description": "Test post approval description"
        }

        response = self.client.post(reverse('manager:audit_view'), post_data, format="json")
        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("count", post_data["count"]))
        expect(response.data).to(have_key("reimbursement", post_data["reimbursement"]))
        expect(response.data).to(have_key("earnings_per_audit", post_data["earnings_per_audit"]))
        expect(response.data['store']['city']).to(have_key("state", post_data["state"]))


    def test_city_wise_audit(self):

        post_data = {
            "audit_cycle": self.audit_cycle.id,
            "audit_region": "city",
            "store": self.client_store_list[0].id,
            "earnings_per_audit": 800,
            "reimbursement": 400,
            "count": 5,
            "post_approval_description": "Test post approval description"
        }

        response = self.client.post(reverse('manager:audit_view'), post_data, format="json")
        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("count", post_data["count"]))
        expect(response.data).to(have_key("reimbursement", post_data["reimbursement"]))
        expect(response.data).to(have_key("earnings_per_audit", post_data["earnings_per_audit"]))
        expect(response.data['store']).to(have_key("id", post_data["store"]))