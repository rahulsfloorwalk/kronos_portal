from django.test import TestCase

from faker import Faker

from auditor.models import AuditApplication
from audit_store.models import AuditStore
from audit.models import AuditCycle
from audit.service.audit_cycle import get_audit_cycle_stats

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
