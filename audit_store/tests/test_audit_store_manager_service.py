from model_mommy import mommy
from expects import expect, have_key

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound, AppLogicError
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo
from audit.models import AuditCycle, ReportAttribute

from audit_store import service_manager


class AuditStoreManagerServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)
        self.audit_cycle = mommy.make(AuditCycle)

    def test_submit_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.submit_report(audit_store.id, auditor.id)

    def test_submit_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        modified_audit_store = service_manager.submit_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.SUBMITTED, modified_audit_store.status)

    def test_revert_submit_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.revert_submit_report(audit_store.id, auditor.id)

    def test_revert_submit_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)
        modified_audit_store = service_manager.revert_submit_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.ACKNOWLEDGED, modified_audit_store.status)

    def test_qa_ok_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.qa_ok_report(audit_store.id, auditor.id)

    def test_qa_ok_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.AVERAGE)
        modified_audit_store = service_manager.qa_ok_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.PM_REVIEW, modified_audit_store.status)

    def test_pm_revert_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.pm_revert_report(audit_store.id, auditor.id)

    def test_pm_revert_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        modified_audit_store = service_manager.pm_revert_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.SUBMITTED, modified_audit_store.status)

    def test_complete_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.complete_report(audit_store.id, auditor.id)

    def test_complete_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user, qa_rating=AuditStore.AVERAGE)
        modified_audit_store = service_manager.complete_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.COMPLETED, modified_audit_store.status)

    def test_revert_complete_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.revert_complete_report(audit_store.id, auditor.id)

    def test_revert_complete_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        modified_audit_store = service_manager.revert_complete_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.PM_REVIEW, modified_audit_store.status)

    def test_accept_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.accept_report(audit_store.id, auditor.id)

    def test_accept_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        modified_audit_store = service_manager.accept_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.ACCEPTED, modified_audit_store.status)

    def test_reject_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.reject_report(audit_store.id, auditor.id)

    def test_reject_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        modified_audit_store = service_manager.reject_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.REJECTED, modified_audit_store.status)

    def test_fail_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.fail_report(audit_store.id, auditor.id)

    def test_fail_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        modified_audit_store = service_manager.fail_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.FAILED, modified_audit_store.status)

    def test_withdraw_report_raises_when_user_is_not_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com", groups=[self.auditor_group])
        with self.assertRaises(ObjectNotFound):
            service_manager.withdraw_report(audit_store.id, auditor.id)

    def test_withdraw_report_changes_report_status(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        modified_audit_store = service_manager.withdraw_report(audit_store.id, self.manager_user.id)
        self.assertEqual(AuditStore.WITHDRAWN, modified_audit_store.status)

    def test_set_reimbursement_raises_when_report_is_not_editable(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        with self.assertRaisesRegex(AppLogicError, "cannot set reimbursement now"):
            service_manager.set_reimbursement(audit_store.id, 2000, self.manager_user.id)

    def test_set_reimbursement_sets_reimbursement_when_report_is_editable(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        audit_store = service_manager.set_reimbursement(audit_store.id, 2000, self.manager_user.id)
        self.assertEqual(audit_store.reimbursement, 2000)

    def test_set_earnings_per_audit_raises_when_report_is_not_editable(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        with self.assertRaisesRegex(AppLogicError, "cannot set earnings per audit now"):
            service_manager.set_earnings_per_audit(audit_store.id, 2000, self.manager_user.id)

    def test_set_earnings_per_audit_sets_earnings_per_audit_when_report_is_editable(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        audit_store = service_manager.set_earnings_per_audit(audit_store.id, 2000, self.manager_user.id)
        self.assertEqual(audit_store.earnings_per_audit, 2000)

    def test_set_report_attribute_value_sets_attribute_option_when_report_is_editable(self):
        selected_option_id = "opt1"
        attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": selected_option_id,
                    "option_label": "label1"
                },
                {
                    "option_id": "opt2",
                    "option_label": "label2"
                },
            ],
        }
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)
        report_attribute = mommy.make(ReportAttribute, audit_cycle=audit_store.audit.audit_cycle,
                                      attribute_data=attribute_data)

        saved_audit_store = service_manager.set_report_attribute_value(audit_store.id, report_attribute.json_id, selected_option_id,
                                                                       self.manager_user.id)
        expect(saved_audit_store.attribute_data).to(have_key(report_attribute.json_id, selected_option_id))

    def test_set_report_attribute_value_raises_when_report_is_not_editable(self):
        selected_option_id = "opt1"
        attribute_data = {
            "version": 1,
            "options": [
                {
                    "option_id": selected_option_id,
                    "option_label": "label1"
                },
                {
                    "option_id": "opt2",
                    "option_label": "label2"
                },
            ],
        }
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        report_attribute = mommy.make(ReportAttribute, audit_cycle=audit_store.audit.audit_cycle, attribute_data=attribute_data)
        with self.assertRaisesRegex(AppLogicError, "cannot set report attribute now"):
            service_manager.set_report_attribute_value(audit_store.id, report_attribute.json_id, selected_option_id, self.manager_user.id)
