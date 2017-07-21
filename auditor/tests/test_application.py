from datetime import date

from django.test import TestCase

from django.contrib.auth.models import User, Group

from model_mommy import mommy

from kronos.exceptions import AppLogicError, ObjectNotFound
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

from ..models import ProfileInfo

from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication

from manager.service import audit as audit_service

class AuditApplicationTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.auditor_user = User.objects.create(username="auditor@foobar.com", email="auditor@foobar.com", password="top_secret")
        self.auditor_user.groups.add()
        self.auditor_user.save()
        self.profile = mommy.make(ProfileInfo, user=self.auditor_user)

        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com", groups=[self.manager_group])

    def test_apply_already_applied(self):
        audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ACTIVE,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        audit_service.apply( audit.id, self.profile.id, date(2017, 6, 5))
        self.assertRaises(AppLogicError, audit_service.apply, audit.id, self.profile.id, date(2017, 6, 18))

    def test_apply_date_in_range(self):
        audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ACTIVE,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        application = audit_service.apply( audit.id, self.profile.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

    def test_apply_date_out_of_range(self):
        audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ACTIVE,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        self.assertRaises(AppLogicError, audit_service.apply, audit.id, self.profile.id, date(2017, 6, 21))

    def test_apply_audit_cycle_status_active_and_upcoming(self):
        upcoming_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.UPCOMING,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )

        application = audit_service.apply( upcoming_audit.id, self.profile.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

        active_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ACTIVE,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )

        application = audit_service.apply( active_audit.id, self.profile.id, date(2017, 6, 5))
        self.assertEqual(application.audit_date, date(2017, 6, 5))
        self.assertEqual(application.status, AuditApplication.APPLIED)

    def test_apply_audit_cycle_status_preparation_or_report_or_archive(self):
        preparation_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.PREPARATION,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        self.assertRaises(AppLogicError, audit_service.apply, preparation_audit.id, self.profile.id, date(2017, 6, 21))

        report_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.REPORT,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        self.assertRaises(AppLogicError, audit_service.apply, report_audit.id, self.profile.id, date(2017, 6, 21))

        archived_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ARCHIVED,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        self.assertRaises(AppLogicError, audit_service.apply, archived_audit.id, self.profile.id, date(2017, 6, 21))


    def test_cancel_audit_cycle_active_or_upcoming(self):
        upcoming_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.UPCOMING,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        audit_service.apply( upcoming_audit.id, self.profile.id, date(2017, 6, 5))
        application = audit_service.cancel( upcoming_audit.id, self.profile.id)
        self.assertEqual(application.status, AuditApplication.NOT_APPLIED)

        active_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ACTIVE,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        audit_service.apply( active_audit.id, self.profile.id, date(2017, 6, 5))
        application = audit_service.cancel( active_audit.id, self.profile.id)
        self.assertEqual(application.status, AuditApplication.NOT_APPLIED)


    def test_already_cancelled(self):
        audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ACTIVE,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        audit_service.apply( audit.id, self.profile.id, date(2017, 6, 5))
        audit_service.cancel( audit.id, self.profile.id)
        self.assertRaises(AppLogicError, audit_service.cancel, audit.id, self.profile.id)

    def test_cancel_without_application(self):
        audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ACTIVE,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        self.assertRaises(ObjectNotFound, audit_service.cancel, audit.id, self.profile.id)


    def test_cancel_audit_cycle_status_preparation_or_report_or_archive(self):
        preparation_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.PREPARATION,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        application = mommy.make( AuditApplication,
                audit=preparation_audit,
                audit_date=date(2017,6,5),
                status=AuditApplication.APPLIED,
                profileinfo=self.profile,
            )
        self.assertRaises(AppLogicError, audit_service.cancel, preparation_audit.id, self.profile.id)

        report_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.REPORT,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        application = mommy.make( AuditApplication,
                audit=report_audit,
                audit_date=date(2017,6,5),
                status=AuditApplication.APPLIED,
                profileinfo=self.profile,
            )
        self.assertRaises(AppLogicError, audit_service.cancel, report_audit.id, self.profile.id)

        archived_audit = mommy.make( Audit,
                audit_cycle__status=AuditCycle.ARCHIVED,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017,6,20),
            )
        application = mommy.make( AuditApplication,
                audit=archived_audit,
                audit_date=date(2017,6,5),
                status=AuditApplication.APPLIED,
                profileinfo=self.profile,
            )
        self.assertRaises(AppLogicError, audit_service.cancel, archived_audit.id, self.profile.id)
