from django.test import TestCase
from django.contrib.auth.models import User, Group
from model_mommy import mommy
from expects import expect, have_length

from answer.models import Answer
from audit_store.models import AuditStore
from audit.models import AuditCycle
from answer.service import answer as answer_service
from questionnaire.models import Question
from registration.models import GROUP_NAME_AUDITOR


class AnswerServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.audit_cycle = mommy.make(AuditCycle)
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.other_questions = mommy.make(Question, section__audit_cycle_id=self.audit_cycle.id, _quantity=5)
        for question in self.other_questions:
            mommy.make(Answer, question=question, audit_store__user=self.auditor_user)

    def test_find_by_audit_store_and_questions(self):
        audit_store = mommy.make(AuditStore, audit__audit_cycle_id=self.audit_cycle.id, user=self.auditor_user)
        questions = mommy.make(Question, section__audit_cycle_id=self.audit_cycle.id, _quantity=5)
        answers = []
        for question in questions:
            answer = mommy.make(Answer, audit_store=audit_store, question=question)
            answers.append(answer)

        answers = answer_service.find_by_audit_store_id_and_questions(audit_store.id, questions)
        answers2 = answer_service.find_by_audit_store_id_and_questions(audit_store.id, self.other_questions)
        expect(answers).to(have_length(5))
        expect(answers2).to(have_length(0))
