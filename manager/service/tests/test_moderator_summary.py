from datetime import date
from django.test import TestCase
from django.contrib.auth.models import User, Group
from guardian.shortcuts import assign_perm

from model_mommy import mommy
from expects import expect, equal, have_length, have_keys, have_key

from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR
from auditor.models import ProfileInfo
from manager.service.moderator_summary import moderator_summary_for_audit_cycle
from manager.service.moderator_summary import moderator_summary_global

class ModeratorSummaryTestCase(TestCase):
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


    def test_moderator_summary_for_audit_cycle_returns_report_counts_for_every_status_and_active_moderator(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)

        moderator1 = mommy.make(User, username="moderator1@foobar.com", email="moderator1@foobar.com", groups=[self.moderator_group])
        moderator2 = mommy.make(User, username="moderator2@foobar.com", email="moderator2@foobar.com", groups=[self.moderator_group])
        moderator3 = mommy.make(User, username="moderator3@foobar.com", email="moderator3@foobar.com", groups=[self.moderator_group])
        moderator4 = mommy.make(User, username="moderator4@foobar.com", email="moderator4@foobar.com", groups=[self.moderator_group])

        report1 = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.ASSIGNED)
        report2 = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.ACKNOWLEDGED)
        report3 = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.SUBMITTED)
        report4 = mommy.make(AuditStore, user=self.auditor_user, audit=audit, status=AuditStore.COMPLETED)

        assign_perm('moderator_manage', moderator1, report1)
        assign_perm('moderator_manage', moderator2, report2)
        assign_perm('moderator_manage', moderator3, report3)
        assign_perm('moderator_manage', moderator3, report4)
        assign_perm('moderator_manage', moderator4, report4)

        moderator4.is_active = False
        moderator4.save()

        data = moderator_summary_for_audit_cycle(audit_cycle.id)

        expect(data).to(have_length(3))
        expect(data).to(have_keys(moderator1.id, moderator2.id, moderator3.id))
        expect(data[moderator1.id]).to(have_key(AuditStore.ASSIGNED, equal(1)))
        expect(data[moderator2.id]).to(have_key(AuditStore.ACKNOWLEDGED, equal(1)))
        expect(data[moderator3.id]).to(have_keys({AuditStore.SUBMITTED: 1, AuditStore.COMPLETED: 1}))


    def test_moderator_summary_global_returns_report_counts_for_specfic_status_and_active_moderator(self):
        moderator1 = mommy.make(User, username="moderator1@foobar.com", email="moderator1@foobar.com", groups=[self.moderator_group])
        moderator2 = mommy.make(User, username="moderator2@foobar.com", email="moderator2@foobar.com", groups=[self.moderator_group])
        moderator3 = mommy.make(User, username="moderator3@foobar.com", email="moderator3@foobar.com", groups=[self.moderator_group])
        moderator4 = mommy.make(User, username="moderator4@foobar.com", email="moderator4@foobar.com", groups=[self.moderator_group])

        audit_cycle1 = mommy.make(AuditCycle, start_date=date(2018, 8, 1), end_date=date(2018, 9, 1), status=AuditCycle.REPORT)
        audit_cycle2 = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit1 = mommy.make(Audit, audit_cycle=audit_cycle1)
        audit2 = mommy.make(Audit, audit_cycle=audit_cycle2)

        report1 = mommy.make(AuditStore, user=self.auditor_user, audit=audit1, status=AuditStore.ASSIGNED)
        report2 = mommy.make(AuditStore, user=self.auditor_user, audit=audit2, status=AuditStore.ACKNOWLEDGED)
        report3 = mommy.make(AuditStore, user=self.auditor_user, audit=audit1, status=AuditStore.SUBMITTED)
        report4 = mommy.make(AuditStore, user=self.auditor_user, audit=audit2, status=AuditStore.COMPLETED)

        assign_perm('moderator_manage', moderator1, report1)
        assign_perm('moderator_manage', moderator2, report2)
        assign_perm('moderator_manage', moderator3, report3)
        assign_perm('moderator_manage', moderator3, report4)
        assign_perm('moderator_manage', moderator4, report4)

        moderator4.is_active = False
        moderator4.save()

        data = moderator_summary_global()

        expect(data).to(have_length(3))
        expect(data).to(have_keys(moderator1.id, moderator2.id, moderator3.id))
        expect(data[moderator1.id]).to(have_key(AuditStore.ASSIGNED, equal(1)))
        expect(data[moderator2.id]).to(have_key(AuditStore.ACKNOWLEDGED, equal(1)))
        expect(data[moderator3.id]).to(have_keys({AuditStore.SUBMITTED: 1, AuditStore.COMPLETED: 1}))

