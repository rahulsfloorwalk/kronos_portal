from django.test import TestCase

from model_mommy import mommy
from expects import expect, equal

from questionnaire.models import Section
from questionnaire.models import Question

class SectionTestCase(TestCase):

    def test_max_marks_returns_total_of_max_marks_for_every_question_when_questions_are_not_prefetched(self):
        section = mommy.make(Section)
        mommy.make(Question, max_marks=1, section=section, _quantity=4)
        expect(section.max_marks()).to(equal(4))

    def test_max_marks_returns_total_of_max_marks_for_every_question_when_questions_are_prefetched(self):
        section = mommy.make(Section)
        mommy.make(Question, max_marks=1, section=section, _quantity=4)
        section = Section.objects.filter(pk=section.id).prefetch_related("questions").first()
        expect(section.max_marks()).to(equal(4))
