from model_mommy import mommy
from audit_store.models import AuditStore

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.test_utils import catch_signal
from kronos.exceptions import AppLogicError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo
from audit_store.signals import audit_store_status_change


class AuditStoreTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_qa_ok_changes_status_to_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        audit_store.qa_ok(by=self.manager_user)

        self.assertEqual(audit_store.status, AuditStore.PM_REVIEW)

    def test_qa_ok_sends_status_change_signal(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.BAD)

        with catch_signal(audit_store_status_change) as mock:
            audit_store.qa_ok(by=self.manager_user)

            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.PM_REVIEW,
                old_status=AuditStore.SUBMITTED,
                user_actor=self.manager_user,
            )

    def test_qa_ok_raises_when_report_is_not_rated(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=None)
        with self.assertRaises(AppLogicError, msg="Please rate report before before forwarding for PM Review."):
            audit_store.qa_ok(by=self.manager_user)

    def test_qa_ok_raises_when_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Report cannot be forwarded for PM Review now."):
            audit_store.qa_ok(by=self.manager_user)

    def test_qa_ok_does_not_send_status_change_signal_when_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            self.assertRaises(AppLogicError, audit_store.qa_ok, by=self.manager_user)
            mock.assert_not_called()

    def test_pm_revert_changes_status_to_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        audit_store.pm_revert(by=self.manager_user)
        self.assertEqual(audit_store.status, AuditStore.SUBMITTED)

    def test_pm_revert_sends_status_change_signal(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)

        with catch_signal(audit_store_status_change) as mock:
            audit_store.pm_revert(by=self.manager_user)
            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.SUBMITTED,
                old_status=AuditStore.PM_REVIEW,
                user_actor=self.manager_user,
            )

    def test_pm_revert_raises_when_status_is_not_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Report cannot be reverted to QA now."):
            audit_store.pm_revert(by=self.manager_user)

    def test_pm_revert_does_not_send_status_change_signal_when_status_is_not_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            self.assertRaises(AppLogicError, audit_store.pm_revert, by=self.manager_user)
            mock.assert_not_called()

    def test_rate_sets_rating_correctly(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)
        rating = AuditStore.GOOD
        audit_store.rate(rating)
        self.assertEqual(audit_store.qa_rating, rating)

    def test_rate_raises_when_report_is_not_submitted_or_qa_ok(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Report status is not QA 2"):
            audit_store.rate(AuditStore.BAD)

    def test_rate_raises_when_rating_is_invalid(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Invalid Rating"):
            audit_store.rate(5)

    def test_is_qa_rated_returns_false_when_qa_rating_is_none(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=None)
        self.assertFalse(audit_store.is_qa_rated())

    def test_is_qa_rated_returns_true_when_qa_rating_is_not_none(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.AVERAGE)
        self.assertTrue(audit_store.is_qa_rated())
