from model_mommy import mommy
from faker import Faker

from django.test import TestCase

from kronos.exceptions import AppLogicError
from answer.models import Answer
from questionnaire.models import Question

fake = Faker()
class AnswerTestCase(TestCase):

    def test_not_applicable_defaults_to_false(self):
        answer = mommy.make(Answer, audit_store__user__email=fake.email())
        self.assertFalse(answer.not_applicable)

    def test_set_not_applicable_sets_correctly(self):
        answer = mommy.make(Answer, audit_store__user__email=fake.email())
        answer.set_not_applicable(True)
        self.assertTrue(answer.not_applicable)
        answer.set_not_applicable(False)
        self.assertFalse(answer.not_applicable)

    def test_set_answer_comment_sets_answer_comment_correctly(self):
        answer = mommy.make(Answer, audit_store__user__email=fake.email(), question__question_type=Question.MUTEX)
        comment = "Foobar"
        answer.set_answer_comment(comment)
        self.assertEqual(comment, answer.answer_comment)

    def test_set_answer_comment_raises_when_question_type_is_not_mutex(self):
        answer = mommy.make(Answer, audit_store__user__email=fake.email())
        comment = "Foobar"
        with self.assertRaises(AppLogicError, msg="Question type must be mutex"):
            answer.set_answer_comment(comment)
