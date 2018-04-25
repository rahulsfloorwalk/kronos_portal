
from django.test import TestCase

from faker import Faker

from audit.models import AuditCycle
from client.service.audit_cycle_aggregation import get_audit_cycle_comparison

fake = Faker()

class AuditCycleAggregationTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.client_id = 1
        self.audit_cycle_id = 1
        self.client_user_id = 4
        self.client_admin_id = 5

    def test_get_audit_cycle_comparison(self):
        audit_cycle = AuditCycle.objects.get(pk=self.audit_cycle_id)
        result = get_audit_cycle_comparison(self.client_id, audit_cycle.type)

        self.assertEqual(len(result['headings']), 9)
        self.assertEqual(len(result['section_max_marks']), 9)
        self.assertEqual(result['type'], audit_cycle.type)
        self.assertEqual(len(result['rows']), 12)

        for row in result['rows']:
            self.assertEqual(len(row), 10)

