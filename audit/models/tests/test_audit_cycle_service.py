from django.test import TestCase

from faker import Faker

from auditor.models import AuditApplication
from audit_store.models import AuditStore
from audit.models import AuditCycle
from audit.service.audit_cycle import get_audit_cycle_stats, set_audit_alignment_factor_by_audit_cycle

fake = Faker()

class AuditCycleServiceTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.client_id = 1
        self.audit_cycle_id = 1
        self.client_user_id = 4
        self.client_admin_id = 5

    def test_get_audit_cycle_stats(self):
        audit_cycle = AuditCycle.objects.get(pk=self.audit_cycle_id)
        result = get_audit_cycle_stats(audit_cycle)

        self.assertEqual(set(result['audit_store'].keys()), set([i[0] for i in AuditStore.STATUS]))
        self.assertEqual(set(result['application'].keys()), set([i[0] for i in AuditApplication.STATUS]))

    def test_set_audit_alignment_factors(self):
        audit_alignment_factors = {
            'gender': 'M',
            'education': 'GR',
            'income': '0',
            'car_cost': '1',
            'occupation': 'BUSINESS',
            'interest_area': 'ARCHITECTURE',
            'marital_status': '2',
            'report_rating': 'G',
            'auditor_rating': 'S',
            'from_available_date': '2022-02-01',
            'to_available_date': '2022-02-05',
        }
        audit_cycle = set_audit_alignment_factor_by_audit_cycle(self.audit_cycle_id, audit_alignment_factors)
        self.assertDictEqual(audit_cycle.audit_alignment_factors, audit_alignment_factors)
        self.assertEqual(len(audit_cycle.audit_alignment_factors.keys()), len(audit_alignment_factors.keys()))