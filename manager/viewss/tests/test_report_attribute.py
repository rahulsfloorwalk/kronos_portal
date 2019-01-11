from django.urls import reverse

from model_mommy import mommy
from expects import expect, equal, have_length, have_key, contain_only

from faker import Faker

from .utils import ManagerAPITestCase
from audit.models import AuditCycle
from audit.models import ReportAttribute

fake = Faker()


class ReportAttributeViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(ReportAttributeViewTestCase, self).setUp()
        self.login()

    def test_get_gets_report_attributes(self):
        audit_cycle = mommy.make(AuditCycle)
        mommy.make(ReportAttribute, audit_cycle=audit_cycle, _quantity=3)
        mommy.make(ReportAttribute, audit_cycle=mommy.make(AuditCycle))

        response = self.client.get(reverse('manager:report_attribute_by_audit_cycle_view', kwargs = {
            'audit_cycle_id': audit_cycle.id
        }))
        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_length(3))
        for qt in response.data:
            expect(qt).to(have_key("audit_cycle_id", audit_cycle.id))


    def test_post_creates_new_report_attribute(self):
        audit_cycle = mommy.make(AuditCycle)

        post_data = {
            'label': "MyLabel",
            'option_labels': ["Label One", "Label Two"],
        }

        response = self.client.post(reverse('manager:report_attribute_by_audit_cycle_view', kwargs={
            'audit_cycle_id': audit_cycle.id
        }), post_data, format="json")
        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key('audit_cycle_id', audit_cycle.id))
        expect(response.data).to(have_key('label', post_data["label"]))
        expect([o["option_label"] for o in response.data["attribute_data"]["options"]]).to(contain_only(*post_data["option_labels"]))

