from django.test import TestCase
from django.contrib.auth.models import User, Group

from model_mommy import mommy
from model_mommy.recipe import Recipe

from guardian.shortcuts import assign_perm

from kronos.exceptions import AppLogicError
from answer.models import ReportSection
from answer.service import report_section_moderator as report_section_moderator_service
from audit.models import AuditCycle
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR
from auditor.models import ProfileInfo

class ReportSectionModeratorServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)
        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User,
                                         username="moderator@foobar.com",
                                         email="moderator@foobar.com",
                                         groups=[self.moderator_group])

    def test_set_not_applicable_for_moderator_sets_not_applicable(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            report_section = mommy.make(ReportSection, audit_store=audit_store, section__audit_cycle=audit_cycle)
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                saved_report_section = report_section_moderator_service.set_not_applicable_for_moderator(
                    audit_store.id,
                    report_section.section.id,
                    True,
                    self.moderator_user.id
                )
                self.assertTrue(saved_report_section.not_applicable)
            else:
                with self.assertRaisesRegex(AppLogicError, "Report Section not applicable cannot be set now"):
                    report_section_moderator_service.set_not_applicable_for_moderator(
                        audit_store.id,
                        report_section.section.id,
                        True,
                        self.moderator_user.id
                    )

    def test_set_auditor_comment_for_moderator_sets_auditor_comment_or_raises(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            report_section = mommy.make(ReportSection, audit_store=audit_store, section__audit_cycle=audit_cycle)
            auditor_comment = "Hello World"
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                saved_report_section = report_section_moderator_service.set_auditor_comment_for_moderator(
                    audit_store.id,
                    report_section.section.id,
                    auditor_comment,
                    self.moderator_user.id
                )
                self.assertEqual(auditor_comment, saved_report_section.auditor_comment)
            else:
                with self.assertRaisesRegex(AppLogicError, "Report Section auditor comment cannot be set now"):
                    report_section_moderator_service.set_auditor_comment_for_moderator(
                        audit_store.id,
                        report_section.section.id,
                        auditor_comment,
                        self.moderator_user.id
                    )

    def test_set_pm_comment_for_moderator_sets_pm_comment_or_raises(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            report_section = mommy.make(ReportSection, audit_store=audit_store, section__audit_cycle=audit_cycle)
            pm_comment = "Hello World"
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                saved_report_section = report_section_moderator_service.set_pm_comment_for_moderator(
                    audit_store.id,
                    report_section.section.id,
                    pm_comment,
                    self.moderator_user.id
                )
                self.assertEqual(pm_comment, saved_report_section.pm_comment)
            else:
                with self.assertRaisesRegex(AppLogicError, "Report Section pm comment cannot be set now"):
                    report_section_moderator_service.set_pm_comment_for_moderator(
                        audit_store.id,
                        report_section.section.id,
                        pm_comment,
                        self.moderator_user.id
                    )

