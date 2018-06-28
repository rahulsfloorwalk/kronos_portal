from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from questionnaire.models import QuestionnaireType
from client.models import Client
from auditor.models import ProfileInfo
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

fake = Faker()

class QuestionnaireTypeByClientViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_get_gets_questionnaire_types(self):
        client = mommy.make(Client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=mommy.make(Client))
        self.login()

        response = self.client.get(reverse('manager:questionnaire_type_by_client_view', kwargs = {
            'client_id': client.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)
        for qt in response.data:
            self.assertEqual(qt["client_id"], client.id)

class QuestionnaireTypeViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_creates_new_questionnaire_type(self):
        client = mommy.make(Client)
        self.login()

        post_data = {
            'client': client.id,
            'name': fake.word(),
            'is_default': fake.pybool(),
        }

        response = self.client.post(reverse('manager:questionnaire_type_view'), post_data)
        self.assertEqual(response.status_code, 200)
        for k, v in post_data.items():
            self.assertEqual(response.data[k], post_data[k])


class QuestionnaireTypeIdViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def create_instance(self):
        return mommy.make(QuestionnaireType)

    def test_get_retrieves_the_instance(self):
        self.login()
        questionnaire_type = self.create_instance()

        response = self.client.get(reverse('manager:questionnaire_type_id_view', kwargs={
            "questionnaire_type_id": questionnaire_type.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], questionnaire_type.id)
        self.assertEqual(response.data["name"], questionnaire_type.name)
        self.assertEqual(response.data["is_default"], questionnaire_type.is_default)
        self.assertEqual(response.data["client_id"], questionnaire_type.client_id)

    def test_post_updates_the_instance(self):
        self.login()
        questionnaire_type = self.create_instance()

        post_data = {
            'client': questionnaire_type.client_id,
            'name': fake.word(),
            'is_default': fake.pybool(),
        }

        response = self.client.post(reverse('manager:questionnaire_type_id_view', kwargs={
            "questionnaire_type_id": questionnaire_type.id
        }), post_data)
        self.assertEqual(response.status_code, 200)
        for k, v in post_data.items():
            self.assertEqual(response.data[k], post_data[k])

    def test_delete_deletes_the_instance(self):
        self.login()
        questionnaire_type = self.create_instance()

        response = self.client.delete(reverse('manager:questionnaire_type_id_view', kwargs={
            "questionnaire_type_id": questionnaire_type.id
        }))
        self.assertEqual(response.status_code, 204)
