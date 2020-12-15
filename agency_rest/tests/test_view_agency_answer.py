from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AGENCY

from agency.models import Agency, AgencyUser
from audit.models import AuditCycle
from audit_store.models import AuditStore
from answer.models import Answer
from questionnaire.models import Question

fake = Faker()


class AnswerSubmitViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency = AgencyUser.objects.create(agency=self.agency, user=self.agency_user, full_name=fake.name())
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

    def setup_answer(self):
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        self.audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=self.audit_cycle)
        self.plain_question = mommy.make(Question, question_type=Question.PLAIN, section__audit_cycle=self.audit_cycle)
        self.answer = mommy.make(Answer, audit_store=self.audit_store, question=self.plain_question)


    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_answer_submit_view_submits_answer(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_answer()
        self.login()


        answer_text = "foobar"

        url = reverse("agency_rest:answer_submit_view", kwargs={
            "audit_store_id": self.audit_store.id,
            "question_id": self.plain_question.id
        })
        payload = {
            'answer_text': answer_text,
            'status': True
        }

        response = self.client.post(url, payload, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual(self.plain_question.id, response.data['question_id'])
        self.assertEqual(self.audit_store.id, response.data['audit_store_id'])
        self.assertEqual(answer_text, response.data['answer_text'])

    def test_answer_submit_view_allows_blank_answers(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_answer()
        self.login()

        answer_text = ""

        url = reverse("agency_rest:answer_submit_view", kwargs={
            "audit_store_id": self.audit_store.id,
            "question_id": self.plain_question.id
        })
        payload = {
            'answer_text': answer_text,
            'status': True
        }

        response = self.client.post(url, payload, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual(self.plain_question.id, response.data['question_id'])
        self.assertEqual(self.audit_store.id, response.data['audit_store_id'])
        self.assertEqual(answer_text, response.data['answer_text'])

class AnswerCommentViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency = AgencyUser.objects.create(agency=self.agency, user=self.agency_user, full_name=fake.name())
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

    def setup_answer(self):
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        self.audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=self.audit_cycle)
        self.mutex_question = mommy.make(Question, question_type=Question.MUTEX, section__audit_cycle=self.audit_cycle)
        self.answer = mommy.make(Answer, audit_store=self.audit_store, question=self.mutex_question)


    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_answer_comment_view_saves_answer_comment(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_answer()
        self.login()

        answer_comment = "foobar"

        url = reverse("agency_rest:answer_comment_view", kwargs={
            "audit_store_id": self.audit_store.id,
            "question_id": self.mutex_question.id
        })
        payload = {
            'answer_comment': answer_comment
        }

        response = self.client.post(url, payload, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual(self.mutex_question.id, response.data['question_id'])
        self.assertEqual(self.audit_store.id, response.data['audit_store_id'])
        self.assertEqual(answer_comment, response.data['answer_comment'])

    def test_answer_comment_view_allows_blank_comments(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_answer()
        self.login()

        answer_comment = ""

        url = reverse("agency_rest:answer_comment_view", kwargs={
            "audit_store_id": self.audit_store.id,
            "question_id": self.mutex_question.id
        })
        payload = {
            'answer_comment': answer_comment
        }

        response = self.client.post(url, payload, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual(self.mutex_question.id, response.data['question_id'])
        self.assertEqual(self.audit_store.id, response.data['audit_store_id'])
        self.assertEqual(answer_comment, response.data['answer_comment'])


class AnswerListViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency = AgencyUser.objects.create(agency=self.agency, user=self.agency_user, full_name=fake.name())
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

    def setup_answer(self):
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        self.audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=self.audit_cycle)
        for i in range(5):
            mommy.make(Answer, audit_store=self.audit_store)


    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_answer_list_view_retrieves_answers(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_answer()
        self.login()

        url = reverse("agency_rest:answer_list_view", kwargs={
            "audit_store_id": self.audit_store.id
        })

        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        self.assertEqual(5, len(response.data))
