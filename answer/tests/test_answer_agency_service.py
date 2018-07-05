from django.test import TestCase
from django.contrib.auth.models import User, Group

from model_mommy import mommy

from answer.models import Answer
from audit_store.models import AuditStore
from audit.models import AuditCycle
from registration.models import GROUP_NAME_AGENCY, GROUP_NAME_MANAGER
from answer.service import answer_agency as agency_answer_service
from questionnaire.models import Question


class AnswerAgencyServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                      groups=[self.agency_group])
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

    def test_find_by_audit_store_for_agency(self):
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user, audit__audit_cycle=self.audit_cycle)
        mommy.make(Answer, audit_store=mock_audit_store, _quantity=5)
        answers = agency_answer_service.find_by_audit_store_for_agency(mock_audit_store.id, self.agency_user.id)
        self.assertEqual(5, len(answers))

    def test_find_by_audit_store_and_question_for_agency(self):
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user, audit__audit_cycle=self.audit_cycle)
        mock_question = mommy.make(Question, section__audit_cycle=self.audit_cycle)
        mommy.make(Answer, audit_store=mock_audit_store, question=mock_question)
        answer = agency_answer_service.find_by_audit_store_and_question_for_agency(mock_audit_store.id, mock_question.id, self.agency_user.id)
        self.assertEqual(answer.audit_store, mock_audit_store)
        self.assertEqual(answer.question, mock_question)

    def test_set_answer_comment_by_agency(self):
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=self.audit_cycle)
        mock_question = mommy.make(Question, question_type=Question.MUTEX, section__audit_cycle=self.audit_cycle)
        mommy.make(Answer, audit_store=mock_audit_store, question=mock_question)
        answer_comment = "foobar"
        answer = agency_answer_service.set_answer_comment_by_agency(mock_audit_store.id, mock_question.id, self.agency_user, answer_comment)
        self.assertEqual(answer_comment, answer.answer_comment)

    def test_submit_answer_by_agency(self):
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=self.audit_cycle)
        mock_question = mommy.make(Question, section__audit_cycle=self.audit_cycle)
        mommy.make(Answer, audit_store=mock_audit_store, question=mock_question)
        answer_text = "foobar"
        answer = agency_answer_service.submit_answer_by_agency(mock_audit_store.id, mock_question.id, self.agency_user, answer_text)
        self.assertEqual(answer_text, answer.answer_text)
        self.assertEqual(answer_text, answer.answer_text_original)



