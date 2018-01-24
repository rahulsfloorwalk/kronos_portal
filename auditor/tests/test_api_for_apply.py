import random
import string
from datetime import date

from django.contrib.auth.models import User, Group
from django.urls import reverse

from faker import Faker
from model_mommy import mommy
from model_mommy.recipe import Recipe
from rest_framework.test import APITestCase

from audit.models import AuditCycle, Audit
from auditor.models import ProfileInfo, BankInfo, AdditionalInfo
from manager.models import City
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

fake = Faker()

class AuditApplicationAPITestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.city = City.objects.get(pk=473)

        self.auditor_user = mommy.make(User, username=self.email, email=self.email,
                                       groups=[self.auditor_group])
        self.auditor_user.set_password(self.password)
        self.auditor_user.save()

        self.profile = mommy.make(
            ProfileInfo,
            mobile_number=''.join(random.choice(string.digits) for i in range(10)),
            user=self.auditor_user
        )
        self.bank = mommy.make(BankInfo, account_number=''.join(random.choice(string.digits) for i in range(10)),
                               user=self.auditor_user)
        self.additional = mommy.make(AdditionalInfo, user=self.auditor_user)

        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.manager_user.set_password(self.password)
        self.manager_user.save()

        self.audit_recipe = Recipe(
            Audit,
            audit_cycle__status=AuditCycle.ACTIVE,
            audit_cycle__start_date=date(2017, 6, 1),
            audit_cycle__end_date=date(2017, 6, 20),
            store__city=self.city,
        )

        self.fake_audits = self.audit_recipe.make(_quantity=5)

    def test_can_auditor_apply(self):
        # login first
        self.client.login(username=self.email, password=self.password)

        # try getting a list of available audits
        response = self.client.get(reverse('auditor:available_audits'))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(response.data), 1)

        # try applying for audits before profile info completion
        audit_id = self.fake_audits[0].id
        url = reverse('auditor:audit_application_apply_view', kwargs={'audit_id': audit_id})
        payload = {
            'audit_id': audit_id,
            'profileinfo_id': self.profile.id,
            'audit_date': date(2017, 6, 15)
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(response.data), 1)

        # fill out the profile information
        dob = date(1994, 6, 1).strftime("%Y-%m-%d")
        input_data_profile = {
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'gender': random.choice(ProfileInfo.GENDER)[0],
            'education': random.choice(ProfileInfo.EDUCATION)[0],
            'date_of_birth': dob,
            'marital_status': random.choice(ProfileInfo.MARITAL_STATUS)[0],
            'address': fake.address(),
            'city_id': self.city.id,
            'pincode': fake.zipcode(),
        }

        response = self.client.post(reverse('auditor:profile_info_view'), input_data_profile, format="json")
        self.assertEqual(response.status_code, 200)
        for k, v in input_data_profile.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))
        self.assertTrue(response.data.get("is_complete"))

        # try getting a list of available audits after profile completion
        response = self.client.get(reverse('auditor:available_audits'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)

        # try applying for audits before bank info completion
        audit_id = self.fake_audits[0].id
        url = reverse('auditor:audit_application_apply_view', kwargs={'audit_id': audit_id})
        payload = {
            'audit_id': audit_id,
            'profileinfo_id': self.profile.id,
            'audit_date': date(2017, 6, 15)
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(response.data), 1)

        # fill out the bank information
        input_data_bank = {
            'bank_name': fake.company(),
            'account_holder_name': fake.name(),
            'account_number': fake.numerify(text="###############"),
            'ifsc_code': fake.lexify(text="???????") + fake.numerify(text="######"),
            'pan_number': fake.lexify(text="????") + fake.numerify(text="####"),
        }

        response = self.client.post(reverse('auditor:bank_info_view'), input_data_bank, format="json")
        self.assertEqual(response.status_code, 200)
        for k, v in input_data_bank.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))
        self.assertTrue(response.data.get("is_complete"))

        # try applying for audits after bank info completion
        audit_id = self.fake_audits[0].id
        url = reverse('auditor:audit_application_apply_view', kwargs={'audit_id': audit_id})
        payload = {
            'audit_id': audit_id,
            'profileinfo_id': self.profile.id,
            'audit_date': date(2017, 6, 15)
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)
