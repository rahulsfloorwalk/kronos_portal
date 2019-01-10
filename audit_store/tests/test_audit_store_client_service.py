
from django.test import TestCase
from django.contrib.auth.models import User, Group

from model_mommy import mommy
from expects import expect, have_length, equal, have_keys

from answer.models import Answer
from audit.models import AuditCycle
from audit_store.models import AuditStore
from audit_store import service_client as client_service
from client.models import Store
from questionnaire.models import Question
from guardian.shortcuts import assign_perm
from registration.models import GROUP_NAME_AUDITOR

class AuditStoreClientServiceTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.client_id = 1
        self.store_id = 1
        self.non_admin_client_user_id = 4
        self.admin_client_user_id = 5
        self.client_admin = User.objects.get(pk=self.admin_client_user_id)
        self.store = Store.objects.get(pk=self.store_id)
        self.client_non_admin = User.objects.get(pk=self.non_admin_client_user_id)
        assign_perm('client.clientuser_admin', self.client_admin)
        self.impact_factors = ["Foo1", "Foo2", "Foo3", "Foo4"]
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com", groups=[self.auditor_group])

    def test_find_visible_to_client_user_returns_correct_reports(self):
        assign_perm('clientuser_store_visible', self.client_non_admin, self.store)
        audit_stores = client_service.find_visible_to_client_user(self.client_non_admin)
        self.assertEqual(4, len(audit_stores))

    def test_find_visible_to_client_user_returns_all_reports_to_admin_user(self):
        audit_stores = client_service.find_visible_to_client_user(self.client_admin)
        self.assertEqual(34, len(audit_stores))

    def test_find_impact_factors_by_id_for_clientuser(self):
        audit_cycle = mommy.make(AuditCycle, client_id=self.client_id, status=AuditCycle.ARCHIVED)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, store__client_id=self.client_id, user=self.auditor_user, status=AuditStore.COMPLETED)
        for i in range(10):
            question_data = {
                "version": 1,
                "impact_factors": self.impact_factors[i % 1: i % 4]
            }
            question = mommy.make(Question, section__audit_cycle_id=audit_store.audit.audit_cycle_id, max_marks=7, question_data=question_data)
            mommy.make(Answer, question=question, marks_obtained=i % 7, audit_store=audit_store)
        impact_factors = client_service.find_impact_factors_by_id_for_clientuser(audit_store.id, self.client_admin)
        expect(impact_factors[0]).to(have_keys(name='Foo1', marks_obtained=19, total_marks=49, percentage=39))
        expect(impact_factors[1]).to(have_keys(name='Foo2', marks_obtained=11, total_marks=28, percentage=39))
        expect(impact_factors[2]).to(have_keys(name='Foo3', marks_obtained=3, total_marks=14, percentage=21))
