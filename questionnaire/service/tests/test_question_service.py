from django.test import TestCase
from model_mommy import mommy
from expects import expect, have_length, equal
from audit.models import AuditCycle
from questionnaire.models import Question
from questionnaire.service import question as question_service



class QuestionServiceTestCase(TestCase):

    def setUp(self):
        self.audit_cycle = mommy.make(AuditCycle)
        self.impact_factors = ["Foo1", "Foo2", "Foo3", "Foo4"]

    def test_find_impact_factors_by_audit_cycle_returns_list_correctly(self):
        for i in range(10):
            question_data = {
                "version": 1,
                "impact_factors": self.impact_factors[i % 1: i % 4]
            }
            mommy.make(Question, section__audit_cycle=self.audit_cycle, max_marks=1, question_data=question_data)
        impact_factors = question_service.find_impact_factors_by_audit_cycle(self.audit_cycle.id)
        expect(sorted(impact_factors)).to(equal(self.impact_factors[:3]))

    def test_find_by_audit_cycle_id_and_impact_factor(self):

        for i in range(10):
            question_data = {
                "version": 1,
                "impact_factors": self.impact_factors[i % 1: i % 4]
            }
            mommy.make(Question, section__audit_cycle=self.audit_cycle, max_marks=1, question_data=question_data)
        questions1 = question_service.find_by_audit_cycle_id_and_impact_factor(self.audit_cycle.id, "Foo1")
        questions2 = question_service.find_by_audit_cycle_id_and_impact_factor(self.audit_cycle.id, "Foo2")
        questions3 = question_service.find_by_audit_cycle_id_and_impact_factor(self.audit_cycle.id, "Foo3")
        questions4 = question_service.find_by_audit_cycle_id_and_impact_factor(self.audit_cycle.id, "Foo4")
        expect(questions1).to(have_length(7))
        expect(questions2).to(have_length(4))
        expect(questions3).to(have_length(2))
        expect(questions4).to(have_length(0))