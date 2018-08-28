
from django.test import TestCase
from guardian.shortcuts import assign_perm
from django.contrib.auth.models import User

from model_mommy import mommy

from faker import Faker

from audit.models import AuditCycle
from client.models import Store
from client_report.service import store_trends
from questionnaire.models import QuestionnaireType

fake = Faker()

class StoreTrendsTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_cycle_id = 1
        self.non_admin_client_user_id = 4
        self.admin_client_user_id = 5
        self.questionnaire_type_id = 1
        self.client_id = 1
        self.store1 = Store.objects.get(pk=1)
        self.store2 = Store.objects.get(pk=2)
        self.client_admin = User.objects.get(pk=self.admin_client_user_id)
        self.client_non_admin = User.objects.get(pk=self.non_admin_client_user_id)
        assign_perm('client.clientuser_admin', self.client_admin)

    def test_get_performing_stores_for_client_admin(self):
        audit_cycle = AuditCycle.objects.get(pk=self.audit_cycle_id)
        store_trend = store_trends.get_performing_stores(audit_cycle, self.admin_client_user_id)
        self.assertEqual(len(store_trend), 11)
        self.assertTrue(store_trend[0][1]['value'] >= store_trend[1][1]['value'])

    def test_get_performing_stores_for_client_non_admin(self):
        assign_perm('clientuser_store_visible', self.client_non_admin, self.store1)
        assign_perm('clientuser_store_visible', self.client_non_admin, self.store2)
        audit_cycle = AuditCycle.objects.get(pk=self.audit_cycle_id)
        store_trend = store_trends.get_performing_stores(audit_cycle, self.non_admin_client_user_id)
        self.assertEqual(len(store_trend), 2)
        self.assertTrue(store_trend[0][1]['value'] >= store_trend[1][1]['value'])

    def test_get_performing_stores_by_type_for_clientuser_admin(self):
        performing_stores = store_trends.get_performing_stores_by_type_for_clientuser(self.questionnaire_type_id, self.admin_client_user_id)
        self.assertEqual(performing_stores['type'], self.questionnaire_type_id)
        self.assertEqual(len(performing_stores['columns']), 3)
        self.assertEqual(len(performing_stores['data']), 11)

    def test_get_performing_stores_by_type_for_clientuser_non_admin(self):
        assign_perm('clientuser_store_visible', self.client_non_admin, self.store1)
        assign_perm('clientuser_store_visible', self.client_non_admin, self.store2)
        performing_stores = store_trends.get_performing_stores_by_type_for_clientuser(self.questionnaire_type_id, self.non_admin_client_user_id)
        self.assertEqual(performing_stores['type'], self.questionnaire_type_id)
        self.assertEqual(len(performing_stores['columns']), 3)
        self.assertEqual(len(performing_stores['data']), 2)

    def test_get_performing_stores_by_type_for_clientuser_returns_dict_when_no_audit_cycles_exist_for_questionnaire_type(self):
        qtype = mommy.make(QuestionnaireType, client_id=self.client_id)
        performing_stores = store_trends.get_performing_stores_by_type_for_clientuser(qtype.id, self.admin_client_user_id)

        self.assertIn('type', performing_stores)
        self.assertEqual(performing_stores['type'], qtype.id)

        self.assertIn('columns', performing_stores)
        self.assertEqual(len(performing_stores['columns']), 0)

        self.assertIn('data', performing_stores)
        self.assertEqual(len(performing_stores['data']), 0)

