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

    def test_set_answer_text_sets_answer_text_when_question_type_is_plain(self):
        answer = mommy.make(Answer, audit_store__user__email=fake.email(), question__question_type=Question.PLAIN)
        answer_text = "Foobar"
        answer.set_answer_text(answer_text)
        self.assertEqual(answer_text, answer.answer_text)

    def get_sample_question_data(self):
        return {
            "version": Question.QUESTION_DATA_V1,
            "options": [
                {
                    "value": "Foobar",
                    "marks": 1,
                    "sequence": 1,
                },
            ],
        }

    def test_set_answer_text_sets_answer_text_when_question_type_is_mutex(self):
        question = mommy.make(Question, question_type=Question.MUTEX, question_data=self.get_sample_question_data())
        answer = mommy.make(Answer, audit_store__user__email=fake.email(), question=question)
        answer_text = "Foobar"
        answer.set_answer_text(answer_text)
        self.assertEqual(answer_text, answer.answer_text)

    def test_set_answer_text_raises_when_when_question_type_is_mutex_and_answer_is_not_a_valid_option(self):
        question = mommy.make(Question, question_type=Question.MUTEX, question_data=self.get_sample_question_data())
        answer = mommy.make(Answer, audit_store__user__email=fake.email(), question=question)
        with self.assertRaises(AppLogicError, msg="invalid answer"):
            answer.set_answer_text("whatever")

    def test_set_answer_text_raises_when_answer_is_blank_or_none(self):
        answer = mommy.make(Answer, audit_store__user__email=fake.email(), question__question_type=Question.PLAIN)
        with self.assertRaises(AppLogicError, msg="answer cannot be empty"):
            answer.set_answer_text("")
        with self.assertRaises(AppLogicError, msg="answer cannot be empty"):
            answer.set_answer_text(None)
