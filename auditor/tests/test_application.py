from datetime import date

from django.test import TestCase

from django.contrib.auth.models import User, Group

from model_mommy import mommy
from model_mommy.recipe import Recipe, foreign_key

from kronos.exceptions import AppLogicError, ObjectNotFound
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

from ..models import ProfileInfo

from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication
from audit_store.models import AuditStore

from auditor.service import application_service

class AuditApplicationTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com", groups=[self.auditor_group])
        self.profile = mommy.make(ProfileInfo, user=self.auditor_user)

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
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application_service.apply( audit.id, self.profile.id, date(2017, 6, 5))
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.profile.id, date(2017, 6, 18))

    def test_apply_date_in_range(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = application_service.apply( audit.id, self.profile.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

    def test_apply_date_out_of_range(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.profile.id, date(2017, 6, 21))

    def test_apply_audit_cycle_status_upcoming(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.UPCOMING)
        application = application_service.apply( audit.id, self.profile.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

    def test_apply_audit_cycle_status_active(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = application_service.apply( audit.id, self.profile.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

    def test_apply_audit_cycle_status_preparation(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.PREPARATION)
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.profile.id, date(2017, 6, 21))

    def test_apply_audit_cycle_status_report(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.REPORT)
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.profile.id, date(2017, 6, 21))

    def test_apply_audit_cycle_status_archived(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ARCHIVED)
        self.assertRaises(AppLogicError, application_service.apply, audit.id, self.profile.id, date(2017, 6, 21))

    def test_cancel_audit_cycle_status_upcoming(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.UPCOMING)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        application = application_service.cancel( audit.id, self.profile.id)
        self.assertEqual(application.status, AuditApplication.NOT_APPLIED)

    def test_cancel_audit_cycle_status_active(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        application = application_service.cancel( audit.id, self.profile.id)
        self.assertEqual(application.status, AuditApplication.NOT_APPLIED)


    def test_already_cancelled(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.NOT_APPLIED,
            )
        self.assertRaises(AppLogicError, application_service.cancel, audit.id, self.profile.id)

    def test_cancel_without_application(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        self.assertRaises(ObjectNotFound, application_service.cancel, audit.id, self.profile.id)

    def test_cancel_audit_cycle_status_preparation(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.PREPARATION)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        self.assertRaises(AppLogicError, application_service.cancel, audit.id, self.profile.id)

    def test_cancel_audit_cycle_status_report(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.REPORT)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        self.assertRaises(AppLogicError, application_service.cancel, audit.id, self.profile.id)

    def test_cancel_audit_cycle_status_archive(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ARCHIVED)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        self.assertRaises(AppLogicError, application_service.cancel, audit.id, self.profile.id)

    def test_reject_audit_cycle_status_preparation(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.PREPARATION)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        application = application_service.reject( application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_audit_cycle_status_upcoming(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.PREPARATION)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        application = application_service.reject( application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_audit_cycle_status_active(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        application = application_service.reject( application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_audit_cycle_status_report(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.REPORT)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        application = application_service.reject( application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_audit_cycle_status_archived(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ARCHIVED)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        application = application_service.reject( application.id, self.manager_user)
        self.assertEqual(application.status, AuditApplication.REJECTED)

    def test_reject_status_rejected(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.REJECTED,
            )
        self.assertRaises(AppLogicError, application_service.reject, application.id, self.manager_user)

    def test_approve_same_audit_date(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )
        application = application_service.approve( application.id, application.audit_date ,self.manager_user)
        self.assertEqual(application.status, AuditApplication.APPROVED)
        self.assertEqual(self.auditor_user.auditstore_set.count(), 1)

        audit_store = self.auditor_user.auditstore_set.first()
        self.assertEqual(audit_store.audit_date, application.audit_date)
        self.assertEqual(audit_store.user, self.auditor_user)
        self.assertEqual(audit_store.status, AuditStore.ASSIGNED)
        self.assertEqual(audit_store.audit, audit)

    def test_approve_different_audit_date(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )

        my_audit_date = date(2017,6,17)
        application = application_service.approve( application.id, my_audit_date ,self.manager_user)
        self.assertEqual(application.status, AuditApplication.APPROVED)
        self.assertEqual(self.auditor_user.auditstore_set.count(), 1)

        audit_store = self.auditor_user.auditstore_set.first()
        self.assertEqual(audit_store.audit_date, my_audit_date)
        self.assertEqual(audit_store.user, self.auditor_user)
        self.assertEqual(audit_store.status, AuditStore.ASSIGNED)
        self.assertEqual(audit_store.audit, audit)

    def test_approve_audit_date_out_of_range(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )

        self.assertRaises(AppLogicError, application_service.approve, application.id, date(2017,6,22) ,self.manager_user)

    def test_approve_audit_cycle_status_preparation(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.PREPARATION)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )

        self.assertRaises(AppLogicError, application_service.approve, application.id, application.audit_date, self.manager_user)

    def test_approve_audit_cycle_status_report(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.REPORT)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )

        application = application_service.approve( application.id, application.audit_date ,self.manager_user)
        self.assertEqual(application.status, AuditApplication.APPROVED)
        self.assertEqual(self.auditor_user.auditstore_set.count(), 1)

        audit_store = self.auditor_user.auditstore_set.first()
        self.assertEqual(audit_store.audit_date, application.audit_date)
        self.assertEqual(audit_store.user, self.auditor_user)
        self.assertEqual(audit_store.status, AuditStore.ASSIGNED)
        self.assertEqual(audit_store.audit, audit)

    def test_approve_audit_cycle_status_archived(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ARCHIVED)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )

        self.assertRaises(AppLogicError, application_service.approve, application.id, application.audit_date, self.manager_user)

    def test_approve_already_approved(self):
        audit = self.audit_recipe.make( audit_cycle__status=AuditCycle.ACTIVE)
        application = self.application_recipe.make(
                audit=audit,
                status=AuditApplication.APPLIED,
            )

        application_service.approve( application.id, application.audit_date, self.manager_user)
        self.assertRaises(AppLogicError, application_service.approve, application.id, application.audit_date, self.manager_user)
