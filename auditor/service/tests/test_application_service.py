from datetime import date

from django.contrib.auth.models import User, Group
from django.test import TransactionTestCase
from model_mommy import mommy
from model_mommy.recipe import Recipe
from expects import expect, equal

from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from auditor.models import AuditApplication
from auditor.service import application_service
from auditor.tests.utils import additional_info_recipe
from kronos.exceptions import AppLogicError, ObjectNotFound
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo, BankInfo, Preferences

class AuditApplicationTestCase(TransactionTestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com", groups=[self.auditor_group])
        self.profile = mommy.make(ProfileInfo, user=self.auditor_user, _fill_optional=True)
        self.bank_info = mommy.make(BankInfo, user=self.auditor_user, _fill_optional=True)
        self.additional_info = additional_info_recipe.make(user=self.auditor_user)

        self.prefs = mommy.make(
            Preferences,
            pp_accepted=True,
            agreement_accepted=True,
            user=self.auditor_user
        )

        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com", groups=[self.manager_group])

        self.audit_recipe = Recipe(
            Audit,
            audit_cycle__start_date=date(2017, 6, 1),
            audit_cycle__end_date=date(2017, 6, 20),
        )
        self.application_recipe = Recipe(
            AuditApplication,
            audit_date=date(2017,6,5),
            profileinfo=self.profile,
        )

    def test_apply_already_applied(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application_service.apply(audit.id, self.auditor_user.id, date(2017, 6, 5))
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.auditor_user.id, date(2017, 6, 18))

    def test_apply_date_in_range(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = application_service.apply(audit.id, self.auditor_user.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

    def test_apply_date_out_of_range(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.auditor_user.id, date(2017, 6, 21))

    def test_apply_report_exists(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        mommy.make(AuditStore, user=self.auditor_user, audit=audit, audit_date=date(2015, 6, 5))
        application = application_service.apply(audit.id, self.auditor_user.id, date(2017, 6, 5))
        self.assertTrue(application.report_exists)

    def test_apply_audit_cycle_status_upcoming(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.UPCOMING)
        application = application_service.apply(audit.id, self.auditor_user.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

    def test_apply_audit_cycle_status_active(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = application_service.apply(audit.id, self.auditor_user.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

    def test_apply_audit_cycle_status_preparation(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.PREPARATION)
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.auditor_user.id, date(2017, 6, 21))

    def test_apply_audit_cycle_status_report(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.REPORT)
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.auditor_user.id, date(2017, 6, 21))

    def test_apply_audit_cycle_status_archived(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ARCHIVED)
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.auditor_user.id, date(2017, 6, 21))

    def test_cancel_audit_cycle_status_upcoming(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.UPCOMING)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        application = application_service.cancel(audit.id, self.auditor_user.id)
        self.assertEqual(application.status, AuditApplication.NOT_APPLIED)

    def test_cancel_audit_cycle_status_active(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        application = application_service.cancel(audit.id, self.auditor_user.id)
        self.assertEqual(application.status, AuditApplication.NOT_APPLIED)

    def test_already_cancelled(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        self.application_recipe.make(
            audit=audit,
            status=AuditApplication.NOT_APPLIED,
        )
        self.assertRaises(AppLogicError, application_service.cancel, audit.id, self.auditor_user.id)

    def test_cancel_without_application(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        self.assertRaises(ObjectNotFound, application_service.cancel, audit.id, self.auditor_user.id)

    def test_cancel_audit_cycle_status_preparation(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.PREPARATION)
        self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        self.assertRaises(AppLogicError, application_service.cancel, audit.id, self.auditor_user.id)

    def test_cancel_audit_cycle_status_report(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.REPORT)
        self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        self.assertRaises(AppLogicError, application_service.cancel, audit.id, self.auditor_user.id)

    def test_cancel_audit_cycle_status_archive(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ARCHIVED)
        self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        self.assertRaises(AppLogicError, application_service.cancel, audit.id, self.auditor_user.id)

    def test_reject_audit_cycle_status_preparation(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.PREPARATION)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        application = application_service.reject(application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_audit_cycle_status_upcoming(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.PREPARATION)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        application = application_service.reject(application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_audit_cycle_status_active(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        application = application_service.reject(application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_audit_cycle_status_report(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.REPORT)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        application = application_service.reject(application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_audit_cycle_status_archived(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ARCHIVED)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        application = application_service.reject(application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_status_rejected(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.REJECTED,
        )
        self.assertRaises(AppLogicError, application_service.reject, application.id, self.manager_user)

    def test_approve_same_audit_date(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        application = application_service.approve(application.id, application.audit_date, 3000, 5000, self.manager_user)
        self.assertEqual(application.status, AuditApplication.APPROVED)
        self.assertEqual(self.auditor_user.auditstore_set.count(), 1)

        audit_store = self.auditor_user.auditstore_set.first()
        self.assertEqual(audit_store.audit_date, application.audit_date)
        self.assertEqual(audit_store.user, self.auditor_user)
        self.assertEqual(audit_store.status, AuditStore.ASSIGNED)
        self.assertEqual(audit_store.audit, audit)
        expect(audit_store.reimbursement).to(equal(3000))
        expect(audit_store.earnings_per_audit).to(equal(5000))

    def test_approve_different_audit_date(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )

        my_audit_date = date(2017,6,17)
        application = application_service.approve(application.id, my_audit_date, 3000, 5000, self.manager_user)
        self.assertEqual(application.status, AuditApplication.APPROVED)
        self.assertEqual(self.auditor_user.auditstore_set.count(), 1)

        audit_store = self.auditor_user.auditstore_set.first()
        self.assertEqual(audit_store.audit_date, my_audit_date)
        self.assertEqual(audit_store.user, self.auditor_user)
        self.assertEqual(audit_store.status, AuditStore.ASSIGNED)
        self.assertEqual(audit_store.audit, audit)
        expect(audit_store.reimbursement).to(equal(3000))
        expect(audit_store.earnings_per_audit).to(equal(5000))

    def test_approve_audit_date_out_of_range(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )

        self.assertRaises(AppLogicError, application_service.approve, application.id, date(2017,6,22), 3000, 5000, self.manager_user)

    def test_approve_audit_cycle_status_preparation(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.PREPARATION)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )

        self.assertRaises(AppLogicError, application_service.approve, application.id, application.audit_date, 3000, 5000, self.manager_user)

    def test_approve_audit_cycle_status_report(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.REPORT)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )

        application = application_service.approve(application.id, application.audit_date, 3000, 5000, self.manager_user)
        self.assertEqual(application.status, AuditApplication.APPROVED)
        self.assertEqual(self.auditor_user.auditstore_set.count(), 1)

        audit_store = self.auditor_user.auditstore_set.first()
        self.assertEqual(audit_store.audit_date, application.audit_date)
        self.assertEqual(audit_store.user, self.auditor_user)
        self.assertEqual(audit_store.status, AuditStore.ASSIGNED)
        self.assertEqual(audit_store.audit, audit)
        expect(audit_store.reimbursement).to(equal(3000))
        expect(audit_store.earnings_per_audit).to(equal(5000))

    def test_approve_audit_cycle_status_archived(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ARCHIVED)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )

        self.assertRaises(AppLogicError, application_service.approve, application.id, application.audit_date, 3000, 5000, self.manager_user)

    def test_approve_already_approved(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )

        application_service.approve(application.id, application.audit_date, 3000, 5000, self.manager_user)
        self.assertRaises(AppLogicError, application_service.approve, application.id, application.audit_date, 3000, 5000, self.manager_user)

    def test_avg_qa_rating_returns_rating(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        mommy.make(AuditStore, user=self.auditor_user, status=AuditStore.COMPLETED, qa_rating=AuditStore.GOOD)
        mommy.make(AuditStore, user=self.auditor_user, status=AuditStore.COMPLETED, qa_rating=AuditStore.BAD)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )
        self.assertAlmostEqual(1.0, application.avg_qa_rating())

    def test_waitlist_sets_status_to_waitlisted(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.APPLIED,
        )

        application = application_service.waitlist(application.id, self.manager_user)
        expect(application.status).to(equal(AuditApplication.WAITLISTED))

    def test_waitlist_raises_when_status_is_not_applied(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.WAITLISTED,
        )

        with self.assertRaisesRegex(AppLogicError, "application cannot be waitlisted now"):
            application_service.waitlist(application.id, self.manager_user)

    def test_find_application_by_id_returns_application(self):
        audit = self.audit_recipe.make(audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
            audit=audit,
            status=AuditApplication.WAITLISTED,
        )

        application2 = application_service.find_application_by_id(application.id)
        expect(application2).to(equal(application))

    def test_find_application_by_id_raises_when_application_does_not_exist(self):
        with self.assertRaises(ObjectNotFound):
            application_service.find_application_by_id(45345)
