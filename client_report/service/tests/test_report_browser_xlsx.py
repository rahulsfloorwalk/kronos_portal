from django.contrib.auth.models import User

from django.test import TestCase
from expects import expect, equal

from guardian.shortcuts import assign_perm

from faker import Faker

from client_report.service.tests.match_xlsx import match_xlsx

from client_report.service.report_browser_xlsx import get_aggregate_report_with_filters

fake = Faker()

class ReportBrowserXlsxReportTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.audit_cycle_id = 1
        self.store_id = 1
        self.client_id = 1
        self.incorrect_city_id = 1
        self.city_id = 650
        self.client_user_id = 4
        self.audit_store_id = 1

        self.client_admin_id = 5
        self.client_admin = User.objects.get(pk=self.client_admin_id)
        assign_perm('client.clientuser_admin', self.client_admin)

    def test_get_aggregate_report_with_filters(self):
        snapshot_name = "report_brower_xlsx.get_aggregate_report_with_filters_1.xlsx"
        excel_data, file_name = get_aggregate_report_with_filters(self.audit_cycle_id, self.client_admin_id, {
            "priority": "",
            "type": "",
        })

        #uncomment and run test to update snapshot
        #import os
        #with open(os.path.join(os.path.dirname(__file__), "snapshots", snapshot_name), "wb") as f:
        #    f.write(excel_data.getvalue())

        expect(file_name).to(equal("January 2017_.xlsx"))
        expect(excel_data).to(match_xlsx(snapshot_name))

