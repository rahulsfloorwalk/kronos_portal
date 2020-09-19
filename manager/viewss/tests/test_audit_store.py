from django.urls import reverse

from model_mommy import mommy
from expects import expect, equal, have_key, have_property

from faker import Faker

from .utils import ManagerAPITestCase
from audit.models import Audit, AuditCycle, ReportAttribute
from audit_store.models import AuditStore

fake = Faker()

class AuditStoreIdViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdViewTestCase, self).setUp()
        self.login()

    def test_get_retrieves_the_audit_store(self):
        audit_store = mommy.make(AuditStore, user__email=fake.email)

        response = self.client.get(reverse('manager:audit_store_id_view', kwargs = {
            'audit_store_id': audit_store.id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["audit"]["id"], audit_store.audit.id)
        self.assertEqual(response.data["audit"]["store"]["id"], audit_store.audit.store.id)
        self.assertEqual(response.data["audit"]["store"]["client"]["id"], audit_store.audit.store.client.id)
        self.assertEqual(response.data["audit"]["audit_cycle"]["client"]["id"], audit_store.audit.audit_cycle.client.id)


class AuditStoreByAuditCycleTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreByAuditCycleTestCase, self).setUp()
        self.login()

    def test_get_retrieves_all_audit_stores(self):
        audit_cycle = mommy.make(AuditCycle)
        mommy.make(AuditStore, user__email=fake.email, audit__audit_cycle=audit_cycle, _quantity=5)

        response = self.client.get(reverse('manager:audit_store_by_audit_cycle_view', kwargs = {
            'audit_cycle_id': audit_cycle.id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)
        for report in response.data:
            self.assertEqual(Audit.objects.get(pk=report["audit"]).audit_cycle_id, audit_cycle.id)


class AuditStoreByAuditTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreByAuditTestCase, self).setUp()
        self.login()

    def test_get_retrieves_all_audit_stores(self):
        audit = mommy.make(Audit)
        mommy.make(AuditStore, user__email=fake.email, audit=audit, _quantity=5)

        response = self.client.get(reverse('manager:audit_store_by_audit_id_view', kwargs = {
            'audit_id': audit.id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)
        for report in response.data:
            self.assertEqual(report["audit"], audit.id)


class AuditStoreIdQARatingTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdQARatingTestCase, self).setUp()
        self.login()

    def test_post_sets_rating(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email)
        rating = AuditStore.GOOD

        response = self.client.post(reverse('manager:audit_store_id_qa_rating_view', kwargs = {
            'audit_store_id': audit_store.id
        }), {
            "qa_rating": rating
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["qa_rating"], rating)


class AuditStoreIdSubmitTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdSubmitTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user__email=fake.email, qa_rating=AuditStore.GOOD)

        response = self.client.post(reverse('manager:audit_store_id_submit_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.SUBMITTED)


class AuditStoreIdRevertSubmitTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdRevertSubmitTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_acknowledged(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email, qa_rating=AuditStore.GOOD)
        reason = "reason for revert the audit"

        response = self.client.post(reverse('manager:audit_store_id_unsubmit_view', kwargs = {
            'audit_store_id': audit_store.id
        }), {
            "reason": reason
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.ACKNOWLEDGED)


class AuditStoreIdQAOKTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdQAOKTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email, qa_rating=AuditStore.GOOD)

        response = self.client.post(reverse('manager:audit_store_id_qa_ok_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.PM_REVIEW)


class AuditStoreIdPMRevertTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdPMRevertTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user__email=fake.email, qa_rating=AuditStore.GOOD)

        response = self.client.post(reverse('manager:audit_store_id_pm_revert_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.SUBMITTED)


class AuditStoreIdCompleteTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdCompleteTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_completed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user__email=fake.email, user=self.create_auditor, qa_rating=AuditStore.GOOD)

        response = self.client.post(reverse('manager:audit_store_id_complete_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.COMPLETED)


class AuditStoreIdRevertCompleteTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdRevertCompleteTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user__email=fake.email, qa_rating=AuditStore.GOOD)

        response = self.client.post(reverse('manager:audit_store_id_uncomplete_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.PM_REVIEW)


class AuditStoreIdFailTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdFailTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_failed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user__email=fake.email, qa_rating=AuditStore.GOOD)

        response = self.client.post(reverse('manager:audit_store_id_fail_view', kwargs = {
            'audit_store_id': audit_store.id
        }), {
            "message": "Failed due to non compliance"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.FAILED)


class AuditStoreIdWithdrawTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdWithdrawTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_withdrawn(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user__email=fake.email, qa_rating=AuditStore.GOOD)

        response = self.client.post(reverse('manager:audit_store_id_withdraw_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.WITHDRAWN)


class AuditStoreIdRejectTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdRejectTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_pm_rejected(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user__email=fake.email, qa_rating=AuditStore.GOOD)

        response = self.client.post(reverse('manager:audit_store_id_reject_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.REJECTED)


class AuditStoreIdReimbursementTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdReimbursementTestCase, self).setUp()
        self.login()

    def test_post_sets_reimbursement(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email)
        reimbursement = 2000

        response = self.client.post(reverse('manager:audit_store_id_reimbursement_view', kwargs = {
            'audit_store_id': audit_store.id
        }), {
            "reimbursement": reimbursement
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["reimbursement"], reimbursement)


class AuditStoreIdEarningsPerAuditView(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdEarningsPerAuditView, self).setUp()
        self.login()

    def test_post_sets_reimbursement(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email)
        earnings_per_audit = 2000

        response = self.client.post(reverse('manager:audit_store_id_earnings_per_audit_view', kwargs = {
            'audit_store_id': audit_store.id
        }), {
            "earnings_per_audit": earnings_per_audit
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["earnings_per_audit"], earnings_per_audit)

class AuditStoreIdAcceptTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreIdAcceptTestCase, self).setUp()
        self.login()

    def test_post_changes_status_to_accepted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.create_auditor, reimbursement=5000, earnings_per_audit=2000)

        response = self.client.post(reverse('manager:audit_store_id_accept_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        expect(response.status_code).to(equal(200))
        expect(response.data["status"]).to(equal(AuditStore.ACCEPTED))


class AcceptAllCompletedForAuditCycleTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AcceptAllCompletedForAuditCycleTestCase, self).setUp()
        self.login()

    def test_post_returns_the_correct_count(self):
        audit = mommy.make(Audit, reimbursement=5000, earnings_per_audit=2000)
        mommy.make(AuditStore, status=AuditStore.COMPLETED, audit=audit, user=self.create_auditor, _quantity=5)
        mommy.make(AuditStore, status=AuditStore.ASSIGNED, audit=audit, user=self.create_auditor, _quantity=2)

        response = self.client.post(reverse('manager:accept_all_completed_for_audit_cycle', kwargs = {
            'audit_cycle_id': audit.audit_cycle_id
        }))
        expect(response.status_code).to(equal(200))
        expect(response.data).to(equal(5))

class AuditStoreIdReportAttributeViewTestCase(ManagerAPITestCase):

    url_name = 'manager:audit_store_id_report_attribute_view'

    def setUp(self):
        super(AuditStoreIdReportAttributeViewTestCase, self).setUp()
        self.attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": "one",
                    "option_label": "label1"
                },
                {
                    "option_id": "two",
                    "option_label": "label2"
                },
            ],
        }
        self.login()


    def test_post_sets_report_attribute_value(self):
        selected_option_id = self.attribute_data["options"][0]["option_id"]

        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email)
        report_attribute = mommy.make(ReportAttribute, audit_cycle=audit_store.audit.audit_cycle, attribute_data=self.attribute_data)

        response = self.client.post(reverse(self.url_name, kwargs={
            'audit_store_id': audit_store.id
        }), {
            "json_id": report_attribute.json_id,
            "option_id": selected_option_id,
        })

        expect(response).to(have_property("status_code", 200))
        expect(response.data).to(have_key("attribute_data", {
            report_attribute.json_id: selected_option_id,
        }))

    def test_post_returns_400_when_option_id_is_not_valid(self):

        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email)
        report_attribute = mommy.make(ReportAttribute, audit_cycle=audit_store.audit.audit_cycle, attribute_data=self.attribute_data)

        response = self.client.post(reverse(self.url_name, kwargs={
            'audit_store_id': audit_store.id
        }), {
            "json_id": report_attribute.json_id,
            "option_id": "foobar",
        })

        expect(response).to(have_property("status_code", 400))

    def test_post_returns_404_when_json_id_does_not_exist(self):

        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email)
        mommy.make(ReportAttribute, audit_cycle=audit_store.audit.audit_cycle, attribute_data=self.attribute_data)

        response = self.client.post(reverse(self.url_name, kwargs={
            'audit_store_id': audit_store.id
        }), {
            "json_id": "foobar",
            "option_id": "foobazz",
        })

        expect(response).to(have_property("status_code", 404))
