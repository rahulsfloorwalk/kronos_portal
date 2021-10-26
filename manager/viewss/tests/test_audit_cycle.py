from django.urls import reverse
from django.contrib.auth.models import User, Group
from registration.models import GROUP_NAME_MANAGER

from model_mommy import mommy
from model_mommy.recipe import Recipe

from faker import Faker

from .utils import ManagerAPITestCase
from audit.models import AuditCycle
from questionnaire.models import QuestionnaireType
from client.models import Client

fake = Faker()

class AuditCycleViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditCycleViewTestCase, self).setUp()
        self.login()

    def test_post_creates_new_audit_cycle(self):
        client = mommy.make(Client)
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
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
        }

        response = self.client.post(reverse('manager:audit_cycle_view'), post_data)
        self.assertEqual(response.status_code, 200)
        for k,v in post_data.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))

class AuditCycleIdViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditCycleIdViewTestCase, self).setUp()
        self.login()

    def test_post_updates_existing_audit_cycle(self):
        client = mommy.make(Client)
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        audit_cycle = mommy.make(AuditCycle, client=client, questionnaire_type=questionnaire_type)

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
        }

        response = self.client.post(reverse('manager:audit_cycle_id_view', kwargs={"audit_cycle_id": audit_cycle.id}), post_data)
        self.assertEqual(response.status_code, 200)
        for k,v in post_data.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))

    def test_get_retrieves_existing_instance(self):
        client = mommy.make(Client)
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        audit_cycle = mommy.make(AuditCycle, client=client, questionnaire_type=questionnaire_type)

        response = self.client.get(reverse('manager:audit_cycle_id_view', kwargs={"audit_cycle_id": audit_cycle.id}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], audit_cycle.id)

    def test_delete_removes_existing_instance(self):
        client = mommy.make(Client)
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        audit_cycle = mommy.make(AuditCycle, client=client, questionnaire_type=questionnaire_type)

        response = self.client.delete(reverse('manager:audit_cycle_id_view', kwargs={"audit_cycle_id": audit_cycle.id}))
        self.assertEqual(response.status_code, 204)


class AuditCycleServiceTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditCycleServiceTestCase, self).setUp()
        self.login()

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_get_audit_cycle_by_manager(self):
        manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        manager = mommy.make(User, email="john123@gmail.com", username="john123@gmail.com", groups=[manager_group])

        audit_cycle = Recipe(AuditCycle, start_date = "2021-06-04")
        audit_cycle.make(_quantity=6)
        audit_cycle.make(_quantity=4, client__managers__user=manager)

        post_data = {
            "month": "06",
            "year": "2021"
        }
        response = self.client.post(reverse('manager:audit_cycle_by_manager', kwargs={"manager_id": manager.id}), post_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 4)