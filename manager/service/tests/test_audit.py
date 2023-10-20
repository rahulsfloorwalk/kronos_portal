from datetime import date
from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import AppLogicError
from model_mommy import mommy
from expects import expect, equal

from audit.models import Audit, AuditCycle
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_AGENCY
from auditor.models import ProfileInfo
from agency.models import AgencyUser
from manager.service.audit import fiat_assign
from datetime import timedelta,date

class FiatAssignTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                      groups=[self.agency_group])
        self.agency_profile = mommy.make(AgencyUser, user=self.agency_user)

    # def test_it_assigns_a_report_to_auditor(self):
    #     audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
    #     audit = mommy.make(Audit, audit_cycle=audit_cycle)
    #     today = date.today()
    #     tomorrow = date.today() + timedelta(days=7)
    #     reports = fiat_assign(audit.id, self.auditor_user.email, today, 3000, 4000, 2, self.manager_user)

    #     for report in reports:
    #         expect(report.reimbursement).to(equal(3000))
    #         expect(report.earnings_per_audit).to(equal(4000))
    #         expect(report.user).to(equal(self.auditor_user))

    # def test_it_assigns_a_report_to_agency(self):
    #     audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
    #     audit = mommy.make(Audit, audit_cycle=audit_cycle)
    #     today = date.today()
    #     tomorrow = date.today() + timedelta(days=7)
        
    #     reports = fiat_assign(audit.id, self.agency_user.email, tomorrow, 3000, 4000, 2, self.manager_user)

    #     for report in reports:
    #         expect(report.reimbursement).to(equal(3000))
    #         expect(report.earnings_per_audit).to(equal(4000))
    #         expect(report.user).to(equal(self.agency_user))

    def test_it_raises_when_audit_range_is_out_of_range(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        sample_date = date(2018, 10, 5)
        with self.assertRaisesRegex(AppLogicError, "audit date is out of range"):
            fiat_assign(audit.id, self.auditor_user.email, sample_date, 3000, 4000, 2, self.manager_user)

    def test_that_it_raises_when_audit_cycle_is_archived(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ARCHIVED)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        today = date.today()
        tomorrow = date.today() + timedelta(days=7)
        
        with self.assertRaisesRegex(AppLogicError, "audit_cycle is archived"):
            fiat_assign(audit.id, self.auditor_user.email, today, 3000, 4000, 2, self.manager_user)

    def test_that_it_raises_when_user_with_email_does_not_exist(self):
        audit_cycle = mommy.make(AuditCycle, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE)
        audit = mommy.make(Audit, audit_cycle=audit_cycle)
        sample_date = date(2018, 9, 5)
        with self.assertRaisesRegex(AppLogicError, "email is not valid"):
            fiat_assign(audit.id, "foo@bar.com", sample_date, 3000, 4000, 2, self.manager_user)
