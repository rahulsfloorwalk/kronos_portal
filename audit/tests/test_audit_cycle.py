from django.test import TestCase

from model_mommy import mommy
from model_mommy.recipe import Recipe

from audit.models import Audit, AuditCycle

class AuditCycleTestCase(TestCase):

    def test_audit_count(self):
        audit_cycle = mommy.make(AuditCycle)
        recipe = Recipe(Audit, audit_cycle=audit_cycle)
        recipe.make(count=3)
        recipe.make(count=9)
        recipe.make(count=1)

        self.assertEqual(13, audit_cycle.audit_count())


    def test_trendable_status_matches_snapshot(self):
        all_statuses = set(AuditCycle.ALL_STATUSES)
        trendable_statuses = set(AuditCycle.TRENDABLE_STATUSES)
        expected_difference = {AuditCycle.PREPARATION, AuditCycle.UPCOMING, AuditCycle.ACTIVE, AuditCycle.REPORT}
        self.assertEqual(expected_difference, all_statuses-trendable_statuses)

    def test_live_reporting_status_matches_snapshot(self):
        all_statuses = set(AuditCycle.ALL_STATUSES)
        live_reporting_statuses = set(AuditCycle.LIVE_REPORTING_STATUSES)
        expected_difference = {AuditCycle.PREPARATION, AuditCycle.UPCOMING}
        self.assertEqual(expected_difference, all_statuses - live_reporting_statuses)

    def test_moderator_visible_status_matches_snapshot(self):
        all_statuses = set(AuditCycle.ALL_STATUSES)
        moderator_visible_statuses = set(AuditCycle.MODERATOR_VISIBLE_STATUSES)
        expected_difference = {AuditCycle.PREPARATION, AuditCycle.ARCHIVED}
        self.assertEqual(expected_difference, all_statuses - moderator_visible_statuses)

    def test_moderator_modifiable_status_matches_snapshot(self):
        all_statuses = set(AuditCycle.ALL_STATUSES)
        moderator_modifiable_statuses = set(AuditCycle.MODERATOR_MODIFIABLE_STATUSES)
        expected_difference = {AuditCycle.PREPARATION, AuditCycle.UPCOMING, AuditCycle.CLEARING, AuditCycle.ARCHIVED}
        self.assertEqual(expected_difference, all_statuses - moderator_modifiable_statuses)

    def test_auditor_visible_status_matches_snapshot(self):
        all_statuses = set(AuditCycle.ALL_STATUSES)
        auditor_visible_statuses = set(AuditCycle.AUDITOR_VISIBLE_STATUSES)
        expected_difference = {AuditCycle.PREPARATION, AuditCycle.ARCHIVED}
        self.assertEqual(expected_difference, all_statuses - auditor_visible_statuses)

    def test_agency_visible_status_matches_snapshot(self):
        all_statuses = set(AuditCycle.ALL_STATUSES)
        agency_visible_statuses = set(AuditCycle.AGENCY_VISIBLE_STATUSES)
        expected_difference = {AuditCycle.PREPARATION, AuditCycle.ARCHIVED}
        self.assertEqual(expected_difference, all_statuses - agency_visible_statuses)
        
    def test_manager_dashboard_status_matches_snapshot(self):
        all_statuses = set(AuditCycle.ALL_STATUSES)
        agency_visible_statuses = set(AuditCycle.AGENCY_VISIBLE_STATUSES)
        expected_difference = {AuditCycle.PREPARATION, AuditCycle.ARCHIVED}
        self.assertEqual(expected_difference, all_statuses - agency_visible_statuses)

