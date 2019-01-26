from django.test import TestCase
from model_mommy import mommy
from expects import expect, have_length, equal, contain_only

from kronos.exceptions import AppLogicError
from audit.models import AuditCycle
from questionnaire.models import Question, Section
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

    def test_copy_questions_from_to_copies_all_questions(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        another_section = mommy.make(Section, audit_cycle=audit_cycle)

        questions = mommy.make(Question, section=section, _quantity=4)

        copied_questions = question_service.copy_questions_from_to(section.id, another_section.id)

        expect(copied_questions).to(have_length(len(questions)))
        for q in copied_questions:
            expect(q.section).to(equal(another_section))

        for attr in ("question_txt", "sequence", "question_type", "question_data", "max_marks"):
            expected_list = map(lambda q: getattr(q, attr), questions)
            actual_list = map(lambda q: getattr(q, attr), copied_questions)

            with self.subTest(attr=attr):
                expect(list(actual_list)).to(contain_only(*expected_list))

    def test_copy_questions_from_to_raises_if_destination_already_has_questions(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        another_section = mommy.make(Section, audit_cycle=audit_cycle)

        mommy.make(Question, section=section, _quantity=4)
        mommy.make(Question, section=another_section, _quantity=1)

        with self.assertRaisesRegex(AppLogicError, "section already has questions"):
            question_service.copy_questions_from_to(section.id, another_section.id)
