from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from audit.models import AuditCycle
from questionnaire.models import QuestionnaireType
from client.models import Client
from registration.models import GROUP_NAME_MANAGER

fake = Faker()

class AuditCycleViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_creates_new_audit_cycle(self):
        client = mommy.make(Client)
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        self.login()
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

class AuditCycleIdViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_updates_existing_audit_cycle(self):
        client = mommy.make(Client)
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        audit_cycle = mommy.make(AuditCycle, client=client, questionnaire_type=questionnaire_type)

        self.login()
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

        self.login()

        response = self.client.get(reverse('manager:audit_cycle_id_view', kwargs={"audit_cycle_id": audit_cycle.id}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], audit_cycle.id)

    def test_delete_removes_existing_instance(self):
        client = mommy.make(Client)
        questionnaire_type = mommy.make(QuestionnaireType, client=client)
        audit_cycle = mommy.make(AuditCycle, client=client, questionnaire_type=questionnaire_type)

        self.login()

        response = self.client.delete(reverse('manager:audit_cycle_id_view', kwargs={"audit_cycle_id": audit_cycle.id}))
        self.assertEqual(response.status_code, 204)
