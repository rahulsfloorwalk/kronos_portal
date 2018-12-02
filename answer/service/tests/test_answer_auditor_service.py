from django.test import TestCase
from django.contrib.auth.models import User, Group

from model_mommy import mommy
from expects import expect, equal

from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo
from audit.models import AuditCycle
from audit_store.models import AuditStore
from questionnaire.models import Question
from answer.models import Answer
from answer.service import answer_auditor as answer_auditor_service

class AnswerAuditorServiceTestCase(TestCase):
    fixtures = ['groups']
    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com", groups=[self.auditor_group])
        self.profile_info = mommy.make(ProfileInfo, user=self.auditor_user)

        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

    def test_find_by_audit_store_and_question_for_auditor(self):
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user, audit__audit_cycle=self.audit_cycle)
        mock_question = mommy.make(Question, section__audit_cycle=self.audit_cycle)
        expected_answer = mommy.make(Answer, audit_store=mock_audit_store, question=mock_question)
        actual_answer = answer_auditor_service.find_by_audit_store_and_question_for_auditor(mock_audit_store.id, mock_question.id, self.auditor_user.id)
        expect(actual_answer).to(equal(expected_answer))
