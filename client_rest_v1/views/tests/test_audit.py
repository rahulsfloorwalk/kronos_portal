from client.models import Store
from datetime import date
from django.urls import reverse

from expects import expect, equal, have_key
from model_mommy import mommy

from faker import Faker

from .utils import ClientAPITestCase
from audit.models import AuditCycle, Audit
from client.models import Client

fake = Faker()


class AuditViewTestCase(ClientAPITestCase):
    def setUp(self):
        super().setUp()
        self.audit_cycle = mommy.make(AuditCycle, client = self.client_obj, start_date=date(2018, 9, 1), end_date=date(2018, 9, 30), status=AuditCycle.ACTIVE, created_by_client = True)
        self.client_store_list = self.create_stores()
        self.login()

    def create_stores(self):
        return mommy.make(Store, city__state="IN-MH", client = self.client_obj, _quantity=3)

    def test_state_wise_audit(self):

        post_data = {
            "audit_cycle": self.audit_cycle.id,
            "audit_region": "state",
            "country": "IN",
            "state": "IN-MH",
            "earnings_per_audit": 800,
            "reimbursement": 400,
            "count": 5,
            "post_approval_description": "Test post approval description"
        }

        response = self.client.post(reverse('client_rest_v1:audit_view'), post_data, format="json")
        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("count", post_data["count"]))
        expect(response.data).to(have_key("reimbursement", post_data["reimbursement"]))
        expect(response.data).to(have_key("earnings_per_audit", post_data["earnings_per_audit"]))
        expect(response.data['store']['city']).to(have_key("state", post_data["state"]))

    def test_city_wise_audit(self):

        post_data = {
            "audit_cycle": self.audit_cycle.id,
            "audit_region": "city",
            "store": self.client_store_list[0].id,
            "earnings_per_audit": 800,
            "reimbursement": 400,
            "count": 5,
            "post_approval_description": "Test post approval description"
        }

        response = self.client.post(reverse('client_rest_v1:audit_view'), post_data, format="json")
        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("count", post_data["count"]))
        expect(response.data).to(have_key("reimbursement", post_data["reimbursement"]))
        expect(response.data).to(have_key("earnings_per_audit", post_data["earnings_per_audit"]))
        expect(response.data['store']).to(have_key("id", post_data["store"]))


    def test_post_updates_existing_audit(self):
        client = mommy.make(Client, id=345) 
        store = mommy.make(Store, client=client)
        audit = mommy.make(Audit, count = 10, audit_date = "2018-09-01", earnings_per_audit = 200, reimbursement = 300, store = store, audit_cycle = self.audit_cycle)

        post_data = {
            "audit_cycle": self.audit_cycle.id,
            "count": 10,
            "audit_date": "2018-09-01",
            "earnings_per_audit": 200,
            "reimbursement": 300,
            "store": store.id,
            "post_approval_description": ""
        }

        response = self.client.post(reverse('client_rest_v1:audit_id_view', kwargs={"audit_id": audit.id}), post_data)
        self.assertEqual(response.status_code, 200)
        for k,v in post_data.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))

    def test_get_retrieves_existing_instance(self):
        client = self.client_obj
        store = mommy.make(Store, client=client)
        audit = mommy.make(Audit, count = 10, audit_date = "2018-09-01", earnings_per_audit = 200, reimbursement = 300, store = store, audit_cycle = self.audit_cycle)

        response = self.client.get(reverse('client_rest_v1:audit_id_view', kwargs={"audit_id": audit.id}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], audit.id)

    def test_delete_removes_existing_instance(self):
        client = self.client_obj
        store = mommy.make(Store, client=client)
        audit = mommy.make(Audit, count = 10, audit_date = "2018-09-01", earnings_per_audit = 200, reimbursement = 300, store = store, audit_cycle = self.audit_cycle)

        response = self.client.delete(reverse('client_rest_v1:audit_id_view', kwargs={"audit_id": audit.id}))
        self.assertEqual(response.status_code, 204)