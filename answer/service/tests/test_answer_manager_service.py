from django.test import TestCase
from django.contrib.auth.models import User, Group

from model_mommy import mommy
from model_mommy.recipe import Recipe

from kronos.exceptions import AppLogicError
from answer.models import Answer
from answer.service import answer_manager as answer_manager_service
from audit_store.models import AuditStore
from audit.models import AuditCycle
from questionnaire.models import Question
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo

class AnswerManagerServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_set_not_applicable_for_manager_sets_not_applicable(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            answer = mommy.make(Answer, audit_store=audit_store, question__section__audit_cycle=audit_cycle)
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                saved_answer = answer_manager_service.set_not_applicable_for_manager(
                    audit_store.id,
                    answer.question.id,
                    True
                )
                self.assertTrue(saved_answer.not_applicable)
            else:
                with self.assertRaises(AppLogicError):
                    answer_manager_service.set_not_applicable_for_manager(
                        audit_store.id,
                        answer.question.id,
                        True
                    )

    def test_set_answer_comment_for_manager_sets_answer_comment(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            answer = mommy.make(
                Answer,
                audit_store=audit_store,
                question__section__audit_cycle=audit_cycle,
                question__question_type=Question.MUTEX,
            )
            comment = "Hello World"
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                saved_answer = answer_manager_service.set_answer_comment_for_manager(
                    audit_store.id,
                    answer.question.id,
                    comment
                )
                self.assertEqual(comment, saved_answer.answer_comment)
            else:
                with self.assertRaises(AppLogicError, msg="Answer comment cannot be set now"):
                    answer_manager_service.set_answer_comment_for_manager(
                        audit_store.id,
                        answer.question.id,
                        comment
                    )

    def test_set_answer_text_for_manager_raises_for_blank_answer(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, user=self.auditor_user, status=AuditStore.PM_REVIEW)
        plain_answer = mommy.make(
            Answer,
            audit_store=audit_store,
            question__section__audit_cycle=audit_cycle,
            question__question_type=Question.PLAIN,
        )
        mutex_answer = mommy.make(
            Answer,
            audit_store=audit_store,
            question__section__audit_cycle=audit_cycle,
            question__question_type=Question.MUTEX,
        )
        answer_text = ""
        with self.assertRaisesRegex(AppLogicError, "answer text cannot be blank"):
            answer_manager_service.set_answer_text_for_manager(
                audit_store.id,
                plain_answer.question.id,
                answer_text,
            )
        with self.assertRaisesRegex(AppLogicError, "answer text cannot be blank"):
            answer_manager_service.set_answer_text_for_manager(
                audit_store.id,
                mutex_answer.question.id,
                answer_text,
            )

    def test_set_answer_text_for_manager_sets_answer_text(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            answer = mommy.make(
                Answer,
                audit_store=audit_store,
                question__section__audit_cycle=audit_cycle,
                question__question_type=Question.PLAIN,
            )
            answer_text = "Hello World"
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                saved_answer = answer_manager_service.set_answer_text_for_manager(
                    audit_store.id,
                    answer.question.id,
                    answer_text,
                )
                self.assertEqual(answer_text, saved_answer.answer_text)
            else:
                with self.assertRaisesRegex(AppLogicError, "Answer text cannot be set now"):
                    answer_manager_service.set_answer_text_for_manager(
                        audit_store.id,
                        answer.question.id,
                        answer_text,
                    )

    def test_set_marks_obtained_for_manager_sets_marks_obtained_or_raises_based_on_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            answer = mommy.make(
                Answer,
                audit_store=audit_store,
                question__max_marks=2,
                question__section__audit_cycle=audit_cycle,
                question__question_type=Question.PLAIN,
            )
            marks_obtained = 1
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                saved_answer = answer_manager_service.set_marks_obtained_for_manager(
                    audit_store.id,
                    answer.question.id,
                    marks_obtained,
                )
                self.assertEqual(marks_obtained, saved_answer.marks_obtained)
            else:
                with self.assertRaisesRegex(AppLogicError, "Answer marks obtained cannot be set now"):
                    answer_manager_service.set_marks_obtained_for_manager(
                        audit_store.id,
                        answer.question.id,
                        marks_obtained,
                    )
