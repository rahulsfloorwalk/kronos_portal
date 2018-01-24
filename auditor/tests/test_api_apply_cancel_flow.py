import random
from datetime import date

from django.contrib.auth.models import User, Group
from django.urls import reverse

from model_mommy import mommy
from model_mommy.recipe import Recipe
from rest_framework.test import APITestCase

from faker import Faker

from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication
from auditor.tests.utils import additional_info_recipe
from manager.models import City
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from ..models import ProfileInfo, BankInfo

fake = Faker()

class AuditApplyAPITestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.city = City.objects.get(pk=473)

        self.auditor_user = mommy.make(User, username=self.email, email=self.email, groups=[self.auditor_group])
        self.auditor_user.set_password(self.password)
        self.auditor_user.save()
        self.profile = mommy.make(ProfileInfo, city=self.city, user=self.auditor_user, _fill_optional=True)
        self.bank_info = mommy.make(BankInfo, user=self.auditor_user, _fill_optional=True)
        self.additional_info = additional_info_recipe.make(user=self.auditor_user)

        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com", groups=[self.manager_group])
        self.manager_user.set_password(self.password)
        self.manager_user.save()

        self.audit_recipe = Recipe(
            Audit,
            audit_cycle__status=AuditCycle.ACTIVE,
            audit_cycle__start_date=date(2017, 6, 1),
            audit_cycle__end_date=date(2017, 6, 20),
            store__city=self.city,
        )

        self.audit_recipe.make(_quantity=5)

    def test_apply_cancel_flow(self):
        self.client.login(username=self.email, password=self.password)
        response = self.client.get(reverse('auditor:available_audits'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)
        audit = random.choice(response.data)

        apply_date = date(2017,6,5).strftime("%Y-%m-%d")
        response = self.client.post(
            reverse('auditor:audit_application_apply_view', kwargs={'audit_id':audit['id']}), {
                'audit_date': apply_date
            },
            format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["audit_date"], apply_date)
        self.assertEqual(response.data["status"], AuditApplication.APPLIED)

        response = self.client.get(reverse('auditor:audit_applications_view'))
        self.assertEqual(len(response.data), 1)

        response = self.client.post(
            reverse('auditor:audit_application_cancel_view', kwargs={'audit_id': audit['id']}),
            format="json"
        )
        self.assertEqual(response.data["status"], AuditApplication.NOT_APPLIED)


