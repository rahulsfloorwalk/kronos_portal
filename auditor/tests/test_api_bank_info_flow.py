import string
import random

from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

from ..models import ProfileInfo

fake = Faker()

class BankInfoAPITestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.auditor_user = mommy.make(User, username=self.email, email=self.email, groups=[self.auditor_group])
        self.auditor_user.set_password(self.password)
        self.auditor_user.save()
        self.profile = mommy.make(ProfileInfo, mobile_number=''.join(random.choice(string.digits) for i in range(10)), user=self.auditor_user)

    def test_bank_info_flow(self):
        # login first
        self.client.login(username=self.email, password=self.password)

        # check if the endpoint returns success initially
        response = self.client.get(reverse('auditor:bank_info_view'))
        self.assertEqual(response.status_code, 200)

        # fill out the bank info
        input_data = {
            'account_holder_name': fake.name(),
            'account_number': fake.numerify(text="###############"),
            'ifsc_code': "SBIN0008238",
            'pan_number': "HUYPR2313U",
        }
        response = self.client.post(reverse('auditor:bank_info_view'), input_data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get("is_complete"))
        self.assertTrue(response.data.get("is_valid"))
        self.assertTrue(response.data.get("is_pan_card_valid"))
        self.assertTrue(response.data.get("is_ifsc_code_valid"))
        for k,v in input_data.items():
            self.assertEqual(v.upper(), response.data.get(k))

        # re check if the GET end point is serving the data correctly
        response = self.client.get(reverse('auditor:bank_info_view'))
        self.assertEqual(response.status_code, 200)
        for k,v in input_data.items():
            self.assertEqual(v.upper(), response.data.get(k))

    def test_invalid_ifsc_code(self):
        # login first
        self.client.login(username=self.email, password=self.password)

        # fill out the bank info
        input_data = {
            'ifsc_code': "12345678901",
        }
        response = self.client.post(reverse('auditor:bank_info_view'), input_data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data.get("is_ifsc_code_valid"))
        self.assertFalse(response.data.get("is_valid"))

    def test_invalid_pan_card(self):
        # login first
        self.client.login(username=self.email, password=self.password)

        # fill out the bank info
        input_data = {
            'pan_number': "aASN1232J8"
        }
        response = self.client.post(reverse('auditor:bank_info_view'), input_data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data.get("is_pan_card_valid"))
        self.assertFalse(response.data.get("is_valid"))

    def test_auto_capitalization(self):
        # login first
        self.client.login(username=self.email, password=self.password)

        acc_name = fake.name().lower()
        acc_num = fake.numerify("###########").lower()
        ifsc = fake.lexify(fake.numerify("????#######")).lower()
        pan = fake.lexify(fake.numerify("?????####?")).lower()

        # fill out the bank info
        input_data = {
            'account_holder_name': acc_name,
            'account_number': acc_num,
            'ifsc_code': ifsc,
            'pan_number': pan,
        }
        response = self.client.post(reverse('auditor:bank_info_view'), input_data, format="json")
        self.assertEqual(response.status_code, 200)
        for k,v in input_data.items():
            self.assertEqual(v.upper(), response.data.get(k))
