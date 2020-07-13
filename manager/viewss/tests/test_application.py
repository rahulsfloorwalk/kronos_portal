from datetime import date
from django.urls import reverse

from expects import expect, equal, have_key
from model_mommy import mommy

from faker import Faker

from .utils import ManagerAPITestCase
from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication

fake = Faker()

class AuditApplicationApproveViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditApplicationApproveViewTestCase, self).setUp()
        self.login()

    def test_post_approves_an_existing_application(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        sample_date = date(2018, 9, 5)
        application = mommy.make(AuditApplication, audit=audit, profileinfo=self.create_auditor().profileinfo, audit_date=sample_date, status=AuditApplication.APPLIED)

        post_data = {
            "audit_date": sample_date.strftime("%Y-%m-%d"),
            "earnings_per_audit": 3000,
            "reimbursement": 4000,
            "audit_count": 2,
        }

        response = self.client.post(reverse('manager:audit_application_approve_view', kwargs={
            "application_id": application.id,
        }), post_data, format="json")

        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("audit_date", post_data["audit_date"]))
        expect(response.data).to(have_key("status", AuditApplication.APPROVED))

