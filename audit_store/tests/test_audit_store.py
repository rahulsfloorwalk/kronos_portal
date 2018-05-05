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

    def test_qa_okayed_changes_status_to_qa_ok(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)
        audit_store.qa_okayed(by=self.manager_user)
        self.assertEqual(audit_store.status, AuditStore.QA_OK)

    def test_qa_okayed_sends_status_change_signal(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)

        with catch_signal(audit_store_status_change) as mock:
            audit_store.qa_okayed(by=self.manager_user)
            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.QA_OK,
                old_status=AuditStore.SUBMITTED,
                user_actor=self.manager_user,
            )

    def test_qa_okayed_raises_when_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        self.assertRaises(AppLogicError, audit_store.qa_okayed, by=self.manager_user)

    def test_qa_okayed_does_not_send_status_change_signal_when_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            self.assertRaises(AppLogicError, audit_store.qa_okayed, by=self.manager_user)
            mock.assert_not_called()

    def test_qa_unokayed_changes_status_to_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.QA_OK, user=self.auditor_user)
        audit_store.qa_unokayed(by=self.manager_user)
        self.assertEqual(audit_store.status, AuditStore.SUBMITTED)

    def test_qa_unokayed_sends_status_change_signal(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.QA_OK, user=self.auditor_user)

        with catch_signal(audit_store_status_change) as mock:
            audit_store.qa_unokayed(by=self.manager_user)
            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.SUBMITTED,
                old_status=AuditStore.QA_OK,
                user_actor=self.manager_user,
            )

    def test_qa_unokayed_raises_when_status_is_not_qa_ok(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        self.assertRaises(AppLogicError, audit_store.qa_unokayed, by=self.manager_user)

    def test_qa_unokayed_does_not_send_status_change_signal_when_status_is_not_qa_ok(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            self.assertRaises(AppLogicError, audit_store.qa_unokayed, by=self.manager_user)
            mock.assert_not_called()

