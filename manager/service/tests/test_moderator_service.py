from datetime import date
from django.test import TestCase
from django.contrib.auth.models import User, Group

from guardian.shortcuts import assign_perm

from model_mommy import mommy
from expects import expect, equal, have_length, be_empty

from kronos.exceptions import AppLogicError
from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR
from auditor.models import ProfileInfo
from manager.service import moderator as moderator_service

class ModeratorServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)

        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_assign_audit_store_assigns_report_to_moderator(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)

        moderator = mommy.make(User, username="moderator1@foobar.com", email="moderator1@foobar.com", groups=[self.moderator_group])
        report = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.ASSIGNED)

        report = moderator_service.assign_audit_store(moderator.id, report.id)

        expect(report.assigned_to_moderator()).to(have_length(1))
        expect(report.assigned_to_moderator()[0]).to(equal(moderator))

    def test_assign_audit_store_overwrites_assignment_if_it_exists(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        report = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.ASSIGNED)

        moderator1 = mommy.make(User, username="moderator1@foobar.com", email="moderator1@foobar.com", groups=[self.moderator_group])
        moderator2 = mommy.make(User, username="moderator2@foobar.com", email="moderator2@foobar.com", groups=[self.moderator_group])
        assign_perm('moderator_manage', moderator1, report)

        report = moderator_service.assign_audit_store(moderator2.id, report.id)

        expect(report.assigned_to_moderator()).to(have_length(1))
        expect(report.assigned_to_moderator()[0]).to(equal(moderator2))

    def test_assign_audit_store_overwrites_assignment_if_previous_moderator_is_disabled(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        report = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.ASSIGNED)

        moderator1 = mommy.make(User, username="moderator1@foobar.com", email="moderator1@foobar.com", groups=[self.moderator_group])
        moderator2 = mommy.make(User, username="moderator2@foobar.com", email="moderator2@foobar.com", groups=[self.moderator_group])
        assign_perm('moderator_manage', moderator1, report)
        moderator1.is_active = False
        moderator1.save()

        report = moderator_service.assign_audit_store(moderator2.id, report.id)
        moderator1.is_active = True
        moderator1.save()

        expect(report.assigned_to_moderator()).to(have_length(1))
        expect(report.assigned_to_moderator()[0]).to(equal(moderator2))

    def test_assign_audit_store_raises_if_moderator_is_deactivated(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)

        moderator = mommy.make(User, username="moderator1@foobar.com", email="moderator1@foobar.com", groups=[self.moderator_group], is_active=False)
        report = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.ASSIGNED)
        with self.assertRaisesRegex(AppLogicError, "disabled moderators cannot be assigned reports"):
            moderator_service.assign_audit_store(moderator.id, report.id)

    def test_revoke_audit_store_removes_assignment_if_moderator_is_disabled(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        report = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.ASSIGNED)

        moderator1 = mommy.make(User, username="moderator1@foobar.com", email="moderator1@foobar.com", groups=[self.moderator_group])
        assign_perm('moderator_manage', moderator1, report)
        moderator1.is_active = False
        moderator1.save()

        report = moderator_service.revoke_audit_store(report.id)
        moderator1.is_active = True
        moderator1.save()

        expect(report.assigned_to_moderator()).to(be_empty)
