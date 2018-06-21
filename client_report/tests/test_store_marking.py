
from django.test import TestCase

from faker import Faker

from questionnaire.models import Question
from client_report.service.store_marking import get_scores_for_store_by_questionnaire_type
from client_report.service.store_marking import get_scores_graph_for_store_by_questionnaire_type
from client_report.service.store_marking import get_average_score_for_question_in_audit_cycle
from client_report.service.store_marking import get_question_wise_marks_for_audit_cycle

fake = Faker()

class StoreMarkingTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.questionnaire_type_id = 1
        self.audit_cycle_id = 1
        self.store_id = 1
        self.client_id = 1
        self.question_id = 1

    def test_get_scores_graph_for_store(self):
        scores = get_scores_graph_for_store_by_questionnaire_type(self.store_id, self.client_id, self.questionnaire_type_id)
        self.assertEqual(len(scores), 3)

    def test_get_scores_for_store(self):
        scores = get_scores_for_store_by_questionnaire_type(self.store_id, self.client_id, self.questionnaire_type_id)
        self.assertEqual(len(scores), 2)
        self.assertEqual(len(scores.get('scores')), 25)

    def test_get_question_wise_marks_for_audit_cycle(self):
        scores = get_question_wise_marks_for_audit_cycle(self.audit_cycle_id, self.store_id)
        self.assertEqual(len(scores), 25)

    def test_get_average_score_for_question_in_audit_cycle(self):
        question = Question.objects.get(pk=self.question_id)
        score = get_average_score_for_question_in_audit_cycle(question, self.store_id)
        self.assertAlmostEqual(score.get('marks'), 0.636, 3)
        self.assertAlmostEqual(score.get('color'), 3)
