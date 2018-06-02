from model_mommy import mommy
from model_mommy.recipe import Recipe
from faker import Faker

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.test_utils import catch_signal
from kronos.exceptions import AppLogicError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from audit.models import AuditCycle
from auditor.models import ProfileInfo
from audit_store.models import AuditStore
from audit_store.signals import audit_store_status_change
from questionnaire.models import Section, Question
from answer.models import ReportSection, Answer

fake=Faker()
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
        self.audit_cycle = mommy.make(AuditCycle)

    def test_withdrawable_changes_status_to_withdrawn(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in AuditStore._WITHDRAWABLE_STATUSES:
            audit_store = audit_store_recipe.make(status=status)
            audit_store.withdraw(by=self.manager_user)
            self.assertEqual(audit_store.status, AuditStore.WITHDRAWN)

    def test_withdraw_sends_status_change_signal(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in AuditStore._WITHDRAWABLE_STATUSES:
            audit_store = audit_store_recipe.make(status=status)
            with catch_signal(audit_store_status_change) as mock:
                audit_store.withdraw(by=self.manager_user)

                mock.assert_called_once_with(
                    signal=audit_store_status_change,
                    sender=AuditStore,
                    status=AuditStore.WITHDRAWN,
                    old_status=status,
                    user_actor=self.manager_user,
                )

    def test_not_withdrawable_status_raises_exception(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        not_withdrawable_statuses = list(set(AuditStore._ALL_STATUSES) - set(AuditStore._WITHDRAWABLE_STATUSES))
        for status in not_withdrawable_statuses:
            audit_store = audit_store_recipe.make(status=status)
            with self.assertRaisesRegexp(AppLogicError, "Report cannot be withdrawn now"):
                audit_store.withdraw(by=self.manager_user)

    def test_status_changes_from_assigned_to_acknowledged(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.auditor_user)
        audit_store.acknowledge(by=self.auditor_user)

        self.assertEqual(audit_store.status, AuditStore.ACKNOWLEDGED)

    def test_acknowledge_sends_status_change_signal(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            audit_store.acknowledge(by=self.auditor_user)

            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.ACKNOWLEDGED,
                old_status=AuditStore.ASSIGNED,
                user_actor=self.auditor_user,
            )

    def test_raises_when_acknowledged_by_different_user(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user__email=fake.email())
        with self.assertRaisesRegexp(AppLogicError, "Report cannot be acknowledged by user"):
            audit_store.acknowledge(by=self.auditor_user)

    def test_raises_when_audit_store_is_not_in_assigned_state(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        statuses = list(set(AuditStore._ALL_STATUSES) - {AuditStore.ASSIGNED})
        for status in statuses:
            audit_store = audit_store_recipe.make(status=status)
            with self.assertRaisesRegexp(AppLogicError, "Report cannot be acknowledged now"):
                audit_store.acknowledge(by=self.auditor_user)

    def get_submitable_report(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user,
                                 audit__audit_cycle=self.audit_cycle)
        section_recipe = Recipe(Section, audit_cycle=self.audit_cycle)
        report_section_recipe = Recipe(ReportSection, audit_store=audit_store, auditor_comment="foobar")
        for i in range(3):
            section = section_recipe.make()
            report_section_recipe.make(section=section)
            for i in range(5):
                question = mommy.make(Question, section=section)
                answer = mommy.make(Answer, question=question, audit_store=audit_store, answer_text="foobar",
                                    marks_obtained=1)

        return audit_store

    def test_status_changes_from_acknowledged_to_submitted(self):
        audit_store = self.get_submitable_report()
        audit_store.submit(by=self.auditor_user)

        self.assertEqual(audit_store.status, AuditStore.SUBMITTED)

    def test_submit_sends_status_change_signal(self):
        audit_store = self.get_submitable_report()
        with catch_signal(audit_store_status_change) as mock:
            audit_store.submit(by=self.auditor_user)

            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.SUBMITTED,
                old_status=AuditStore.ACKNOWLEDGED,
                user_actor=self.auditor_user,
            )

    def test_raises_when_submitted_by_different_user(self):
        audit_store = self.get_submitable_report()
        auditor = mommy.make(User, username="faker@foobar.com", email="faker@foobar.com",
                                       groups=[self.auditor_group])
        with self.assertRaisesRegexp(AppLogicError, "Report cannot be submitted by user"):
            audit_store.submit(by=auditor)

    def test_submit_manager_chanages_status_from_acknowledged_to_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        audit_store.submit_manager(by=self.manager_user)

        self.assertEqual(audit_store.status, AuditStore.SUBMITTED)

    def test_submit_manager_sends_status_change_signal_for_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            audit_store.submit_manager(by=self.manager_user)

            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.SUBMITTED,
                old_status=AuditStore.ACKNOWLEDGED,
                user_actor=self.manager_user,
            )

    def test_submit_manager_raises_when_submitted_by_non_manager(self):
        audit_store = self.get_submitable_report()
        with self.assertRaisesRegexp(AppLogicError, "Report cannot be submitted by user"):
            audit_store.submit_manager(by=self.auditor_user)

    def test_submit_manager_raises_when_status_is_not_acknowledged(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.auditor_user)
        with self.assertRaisesRegexp(AppLogicError, "Report cannot be submitted now"):
            audit_store.submit_manager(by=self.manager_user)

    def test_revert_submit_changes_status_from_submitted_to_acknowledged(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)
        audit_store.revert_submit(by=self.manager_user)

        self.assertEqual(audit_store.status, AuditStore.ACKNOWLEDGED)

    def test_revert_submit_sends_status_change_signal_for_manager(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            audit_store.revert_submit(by=self.manager_user)

            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.ACKNOWLEDGED,
                old_status=AuditStore.SUBMITTED,
                user_actor=self.manager_user,
            )

    def test_revert_submit_raises_when_reverted_by_non_manager(self):
        audit_store = self.get_submitable_report()
        with self.assertRaisesRegexp(AppLogicError, "Report cannot be unsubmitted by user"):
            audit_store.revert_submit(by=self.auditor_user)

    def test_revert_submit_raises_when_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with self.assertRaisesRegexp(AppLogicError, "Report cannot be unsubmitted now"):
            audit_store.revert_submit(by=self.manager_user)

    # TODO - write tests for submit and revert for moderator user

    def test_qa_ok_changes_status_to_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        audit_store.qa_ok(by=self.manager_user)

        self.assertEqual(audit_store.status, AuditStore.PM_REVIEW)

    def test_qa_ok_sends_status_change_signal(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.BAD)

        with catch_signal(audit_store_status_change) as mock:
            audit_store.qa_ok(by=self.manager_user)

            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.PM_REVIEW,
                old_status=AuditStore.SUBMITTED,
                user_actor=self.manager_user,
            )

    def test_qa_ok_raises_when_report_is_not_rated(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=None)
        with self.assertRaises(AppLogicError, msg="Please rate report before before forwarding for PM Review."):
            audit_store.qa_ok(by=self.manager_user)

    def test_qa_ok_raises_when_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Report cannot be forwarded for PM Review now."):
            audit_store.qa_ok(by=self.manager_user)

    def test_qa_ok_does_not_send_status_change_signal_when_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            self.assertRaises(AppLogicError, audit_store.qa_ok, by=self.manager_user)
            mock.assert_not_called()

    def test_pm_revert_changes_status_to_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        audit_store.pm_revert(by=self.manager_user)
        self.assertEqual(audit_store.status, AuditStore.SUBMITTED)

    def test_pm_revert_sends_status_change_signal(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)

        with catch_signal(audit_store_status_change) as mock:
            audit_store.pm_revert(by=self.manager_user)
            mock.assert_called_once_with(
                signal=audit_store_status_change,
                sender=AuditStore,
                status=AuditStore.SUBMITTED,
                old_status=AuditStore.PM_REVIEW,
                user_actor=self.manager_user,
            )

    def test_pm_revert_raises_when_status_is_not_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Report cannot be reverted to QA now."):
            audit_store.pm_revert(by=self.manager_user)

    def test_pm_revert_does_not_send_status_change_signal_when_status_is_not_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with catch_signal(audit_store_status_change) as mock:
            self.assertRaises(AppLogicError, audit_store.pm_revert, by=self.manager_user)
            mock.assert_not_called()

    def test_rate_sets_rating_correctly(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)
        rating = AuditStore.GOOD
        audit_store.rate(rating)
        self.assertEqual(audit_store.qa_rating, rating)

    def test_rate_raises_when_report_is_not_submitted_or_qa_ok(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Report cannot be rated now"):
            audit_store.rate(AuditStore.BAD)

    def test_rate_raises_when_rating_is_invalid(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Invalid Rating"):
            audit_store.rate(5)

    def test_is_qa_rated_returns_false_when_qa_rating_is_none(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=None)
        self.assertFalse(audit_store.is_qa_rated())

    def test_is_qa_rated_returns_true_when_qa_rating_is_not_none(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.AVERAGE)
        self.assertTrue(audit_store.is_qa_rated())

    def test_is_withdrawable(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)

        for status in [s[0] for s in AuditStore.STATUS]:
            audit_store = audit_store_recipe.make(status=status)
            if status in AuditStore._WITHDRAWABLE_STATUSES:
                self.assertTrue(audit_store.is_withdrawable())
            else:
                self.assertFalse(audit_store.is_withdrawable())

    def test_is_editable_by_manager_for_all_statuses(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_store = audit_store_recipe.make(status=status)
            self.assertEqual(
                audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES,
                audit_store.is_editable_by_manager()
            )

    def test_is_editable_by_moderator_for_all_statuses(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_store = audit_store_recipe.make(status=status)
            self.assertEqual(
                audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES,
                audit_store.is_editable_by_moderator()
            )

    def test_is_editable_by_auditor_for_all_statuses(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_store = audit_store_recipe.make(status=status)
            self.assertEqual(
                audit_store.status in audit_store._AUDITOR_EDITABLE_STATUSES,
                audit_store.is_editable_by_auditor()
            )

    def test_is_submittable_returns_true(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user, audit__audit_cycle=self.audit_cycle)
        section_recipe = Recipe(Section, audit_cycle=self.audit_cycle)
        report_section_recipe = Recipe(ReportSection, audit_store=audit_store, auditor_comment="foobar")
        for i in range(3):
            section = section_recipe.make()
            report_section_recipe.make(section=section)
            for i in range(5):
                question = mommy.make(Question, section=section)
                answer = mommy.make(Answer, question=question, audit_store=audit_store, answer_text="foobar", marks_obtained=1)
        self.assertTrue(audit_store.is_submitable())

    def test_is_submittable_when_status_is_not_acknowledged(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.auditor_user, audit__audit_cycle=self.audit_cycle)
        with self.assertLogs(logger="audit_store.models", level='DEBUG') as error_log:
            audit_store.is_submitable()
            self.assertIn(
                "DEBUG:audit_store.models:Report not acknowledged",
                error_log.output
            )
        self.assertFalse(audit_store.is_submitable())

    def test_is_submitable_when_section_length_does_not_match_report_section(self):
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle
        )
        mommy.make(Section, audit_cycle=self.audit_cycle)

        with self.assertLogs(logger="audit_store.models", level='DEBUG') as error_log:
            audit_store.is_submitable()
            self.assertIn(
                "DEBUG:audit_store.models:Report not submitable, section length does not match report section length",
                error_log.output
            )
        self.assertFalse(audit_store.is_submitable())
    def test_is_submitable_when_auditor_comment_is_blank(self):
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle
        )
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        mommy.make(ReportSection, audit_store=audit_store, auditor_comment="", section=section)

        with self.assertLogs(logger="audit_store.models", level='DEBUG') as error_log:
            audit_store.is_submitable()
            self.assertIn(
                "DEBUG:audit_store.models:Report not submitable, some auditor comment is incomplete",
                error_log.output
            )
        self.assertFalse(audit_store.is_submitable())

    def test_is_submitable_when_answer_length_does_not_match_questions(self):
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle
        )
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        mommy.make(ReportSection, audit_store=audit_store, auditor_comment="foobar", section=section)
        mommy.make(Question, section=section)

        with self.assertLogs(logger="audit_store.models", level='DEBUG') as error_log:
            audit_store.is_submitable()
            self.assertIn(
                "DEBUG:audit_store.models:Report not submitable, question length does not match answer length",
                error_log.output
            )
        self.assertFalse(audit_store.is_submitable())

    def test_is_submitable_when_answer_text_is_empty(self):
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle
        )
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        mommy.make(ReportSection, audit_store=audit_store, auditor_comment="foobar", section=section)
        question = mommy.make(Question, section=section)
        mommy.make(Answer, question=question, audit_store=audit_store, answer_text="", marks_obtained=1)

        with self.assertLogs(logger="audit_store.models", level='DEBUG') as error_log:
            audit_store.is_submitable()
            self.assertIn(
                "DEBUG:audit_store.models:Report not submitable, some answer is incomplete",
                error_log.output
            )
        self.assertFalse(audit_store.is_submitable())