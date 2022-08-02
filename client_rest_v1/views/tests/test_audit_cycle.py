from django.urls import reverse

from model_mommy import mommy

from faker import Faker

from .utils import ClientAPITestCase
from audit.models import AuditCycle
from client.models import Client
from questionnaire.models import QuestionnaireType

fake = Faker()

class AuditCycleViewTestCase(ClientAPITestCase):

    def setUp(self):
        super(AuditCycleViewTestCase, self).setUp()
        self.login()

    def test_get_gets_audit_cycle(self):
        client = self.client_obj
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        mommy.make(AuditCycle, client=self.client_obj, questionnaire_type=questionnaire_type, created_by_client = True)
        mommy.make(AuditCycle, client=self.client_obj, questionnaire_type=questionnaire_type, created_by_client = True)
        mommy.make(AuditCycle, client=self.client_obj, questionnaire_type=questionnaire_type, created_by_client = True)
        mommy.make(AuditCycle, client=mommy.make(Client))

        response = self.client.get(reverse('client_rest_v1:audit_cycle_view'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)
        for qt in response.data:
            self.assertEqual(qt["client"]["id"], self.client_obj.id)

    def test_post_creates_new_audit_cycle(self):
        client = self.client_obj
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        post_data = {
            "client": client.id,
            "questionnaire_type": questionnaire_type.id,
            "name": "Audit Cycle 1",
            "start_date": "2018-09-01",
            "end_date": "2018-09-29",
            "type": "GENERAL",
            "status": "ACTIVE",
            "description": "This is a sample description",
            "created_by_client": True
        }

        response = self.client.post(reverse('client_rest_v1:audit_cycle_view'), post_data)
        self.assertEqual(response.status_code, 200)
        for k,v in post_data.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))


class AuditCycleIdViewTestCase(ClientAPITestCase):

    def setUp(self):
        super(AuditCycleIdViewTestCase, self).setUp()
        self.login()

    def test_post_updates_existing_audit_cycle(self):
        client = self.client_obj
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        audit_cycle = mommy.make(AuditCycle, client=client, questionnaire_type=questionnaire_type, created_by_client = True)

        post_data = {
            "client": client.id,
            "questionnaire_type": questionnaire_type.id,
            "name": "Audit Cycle 1",
            "start_date": "2018-09-01",
            "end_date": "2018-09-29",
            "type": "GENERAL",
            "status": "ACTIVE",
            "earnings_per_audit": 200,
            "reimbursement": 300,
            "description": "This is a sample description",
            "created_by_client": True
        }

        response = self.client.post(reverse('client_rest_v1:audit_cycle_id_view', kwargs={"audit_cycle_id": audit_cycle.id}), post_data)
        self.assertEqual(response.status_code, 200)
        for k,v in post_data.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))

    def test_get_retrieves_existing_instance(self):
        client = self.client_obj
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        audit_cycle = mommy.make(AuditCycle, client=client, questionnaire_type=questionnaire_type, created_by_client = True)

        response = self.client.get(reverse('client_rest_v1:audit_cycle_id_view', kwargs={"audit_cycle_id": audit_cycle.id}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], audit_cycle.id)
        self.assertEqual(response.data["created_by_client"], audit_cycle.created_by_client)

    def test_delete_removes_existing_instance(self):
        client = self.client_obj
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        audit_cycle = mommy.make(AuditCycle, client=client, questionnaire_type=questionnaire_type, created_by_client = True)

        response = self.client.delete(reverse('client_rest_v1:audit_cycle_id_view', kwargs={"audit_cycle_id": audit_cycle.id}))
        self.assertEqual(response.status_code, 204)