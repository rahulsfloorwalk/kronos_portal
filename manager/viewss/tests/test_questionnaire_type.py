from django.urls import reverse

from model_mommy import mommy

from faker import Faker

from .utils import ManagerAPITestCase
from questionnaire.models import QuestionnaireType
from client.models import Client

fake = Faker()

class QuestionnaireTypeByClientViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(QuestionnaireTypeByClientViewTestCase, self).setUp()
        self.login()

    def test_get_gets_questionnaire_types(self):
        client = mommy.make(Client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=client)
        mommy.make(QuestionnaireType, client=mommy.make(Client))

        response = self.client.get(reverse('manager:questionnaire_type_by_client_view', kwargs = {
            'client_id': client.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)
        for qt in response.data:
            self.assertEqual(qt["client_id"], client.id)

class QuestionnaireTypeViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(QuestionnaireTypeViewTestCase, self).setUp()
        self.login()

    def test_post_creates_new_questionnaire_type(self):
        client = mommy.make(Client)

        post_data = {
            'client': client.id,
            'name': fake.word(),
            'is_default': fake.pybool(),
        }

        response = self.client.post(reverse('manager:questionnaire_type_view'), post_data)
        self.assertEqual(response.status_code, 200)
        for k, v in post_data.items():
            self.assertEqual(response.data[k], post_data[k])


class QuestionnaireTypeIdViewTestCase(ManagerAPITestCase):

    def setUp(self):
        super(QuestionnaireTypeIdViewTestCase, self).setUp()
        self.login()

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
