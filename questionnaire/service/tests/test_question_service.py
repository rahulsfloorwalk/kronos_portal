from django.test import TestCase
from model_mommy import mommy
from expects import expect, have_length
from audit.models import AuditCycle
from questionnaire.models import Question
from questionnaire.service import question as question_service



class QuestionServiceTestCase(TestCase):

    def setUp(self):
        self.audit_cycle = mommy.make(AuditCycle)

    def test_find_filters_questions_correctly(self):
        impact_factors = ["Foo1", "Foo2", "Foo3", "Foo4"]
        for i in range(10):
            question_data = {
                "version": 1,
                "impact_factors": impact_factors[i%1 : i%4]
            }
            mommy.make(Question, section__audit_cycle=self.audit_cycle, max_marks=1, question_data=question_data)
        questions1 = question_service.find_by_audit_cycle_and_impact_factor(self.audit_cycle.id, "Foo1")
        questions2 = question_service.find_by_audit_cycle_and_impact_factor(self.audit_cycle.id, "Foo2")
        questions3 = question_service.find_by_audit_cycle_and_impact_factor(self.audit_cycle.id, "Foo3")
        questions4 = question_service.find_by_audit_cycle_and_impact_factor(self.audit_cycle.id, "Foo4")
        expect(questions1).to(have_length(7))
        expect(questions2).to(have_length(4))
        expect(questions3).to(have_length(2))
        expect(questions4).to(have_length(0))