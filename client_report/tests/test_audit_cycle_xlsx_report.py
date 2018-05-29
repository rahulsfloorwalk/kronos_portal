from django.test import TestCase

from faker import Faker

from audit.models import AuditCycle
from audit_store.models import AuditStore
from audit_store.service import assign_audit_store_to_client_user
from client_report.service import audit_cycle_xlsx_report as xlsx_report_service

fake = Faker()

class AuditCycleXlsxReportTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_cycle_id = 1
        self.city_filter = {'city': 650}
        self.date_filter = {'start_date': '2017-01-15', 'end_date': '2017-01-31'}
        self.client_admin_id = 5
        audit_reports = AuditStore.objects.filter(audit__audit_cycle_id=self.audit_cycle_id)
        for report in audit_reports:
            assign_audit_store_to_client_user(report.id, self.client_admin_id)

    def test_get_aggregate_data_with_date_filter(self):
        audit_cycle_name, sections, questions, filtered_audit_stores, city_name, date_name, month_name\
            = xlsx_report_service.get_aggregate_data_with_filters(self.audit_cycle_id, self.client_admin_id, self.date_filter)
        self.assertEqual(audit_cycle_name, 'January 2017')
        self.assertEqual(5, len(filtered_audit_stores))
        self.assertEqual(city_name, '')
        self.assertEqual(date_name, '2017_01_15_2017_01_31')
        self.assertEqual(month_name, '')

    def test_get_aggregate_data_with_city_filter(self):
        audit_cycle_name, sections, questions, filtered_audit_stores, city_name, date_name, month_name\
            = xlsx_report_service.get_aggregate_data_with_filters(self.audit_cycle_id, self.client_admin_id, self.city_filter)
        self.assertEqual(audit_cycle_name, 'January 2017')
        self.assertEqual(4, len(filtered_audit_stores))
        self.assertEqual(city_name, 'Delhi')
        self.assertEqual(month_name, '')

    def test_get_aggregate_data_without_filters(self):
        audit_cycle_name, sections, questions, filtered_audit_stores, city_name, date_name, month_name\
            = xlsx_report_service.get_aggregate_data_with_filters(self.audit_cycle_id, self.client_admin_id, {})
        self.assertEqual(audit_cycle_name, 'January 2017')
        self.assertEqual(11, len(filtered_audit_stores))
        self.assertEqual(city_name, '')
        self.assertEqual(month_name, '')