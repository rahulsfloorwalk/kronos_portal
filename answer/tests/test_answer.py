from model_mommy import mommy
from faker import Faker
from answer.models import Answer

from django.test import TestCase

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
