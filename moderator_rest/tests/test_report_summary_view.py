from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from guardian.shortcuts import assign_perm

from rest_framework.test import APITestCase

from model_mommy import mommy
from model_mommy.recipe import Recipe

from faker import Faker

from audit.models import AuditCycle
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_MODERATOR, GROUP_NAME_AUDITOR
from questionnaire.models import Section, Question
from answer.models import ReportSection, Answer

fake = Faker()


class AuditStoreIdReportSummaryViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User,
                                         username=self.email,
                                         email=self.email,
                                         password=make_password(self.password),
                                         groups=[self.moderator_group])
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

    def create_reviewable_report(self):
        audit_store = mommy.make(
            AuditStore,
            status=AuditStore.SUBMITTED,
            audit__audit_cycle=self.audit_cycle,
            user=self.auditor_user,
            report_summary="Summary",
            report_summary_original="Summary"
        )
        section_recipe = Recipe(Section, audit_cycle=self.audit_cycle)
        report_section_recipe = Recipe(ReportSection, audit_store=audit_store, auditor_comment="foobar")
        for i in range(3):
            section = section_recipe.make()
            report_section_recipe.make(section=section)
            for i in range(5):
                question = mommy.make(Question, section=section)
                mommy.make(Answer, question=question, audit_store=audit_store, answer_text="foobar")

        return audit_store

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_set_report_summary_sets_report_summary(self):
        audit_store = self.create_reviewable_report()
        assign_perm('moderator_manage', self.moderator_user, audit_store)
        self.login()

        report_summary = "Test report summary"
        data = {
            "report_summary": report_summary,
        }

        response = self.client.post(reverse("moderator:audit_store_id_report_summary_view", kwargs={
            "audit_store_id": audit_store.id
        }), data, format="json")

        self.assertEqual(200, response.status_code)
        self.assertEqual(audit_store.id, response.data["id"])
        self.assertEqual(report_summary, response.data["report_summary"])

