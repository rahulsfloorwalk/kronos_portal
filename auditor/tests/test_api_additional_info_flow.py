import string
import random

from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

from ..models import ProfileInfo
from ..models import AdditionalInfo

fake = Faker()

class AdditionalInfoAPITestCase(APITestCase):
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
        self.profile = mommy.make(AdditionalInfo, referral_code=''.join(random.choice(string.digits + string.ascii_lowercase) for i in range(10)), user=self.auditor_user)

    def test_additional_info_flow(self):
        # login first
        self.client.login(username=self.email, password=self.password)

        # check if the endpoint returns success initially
        response = self.client.get(reverse('auditor:additional_info_view'))
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data.get("referral_code"), 200)
        self.assertNotEqual(response.data.get("referral_code"), "")

        # fill out the bank info
        input_data = {
            'has_car': fake.pybool(),
            'weekend_audit': fake.pybool(),
            'hair_color': random.choice(AdditionalInfo.HAIR_COLOR)[0],
            'height': fake.pyint(),
            'weight': fake.pyint(),
            'distance': fake.pyint(),
            'camera_owned': fake.pybool(),
            'camera_resoulution': random.choice(AdditionalInfo.RESOLUTION)[0],
            'laptop_owned': fake.pybool(),
            'smart_phone_owned': fake.pybool(),
            'occupation': random.choice(AdditionalInfo.OCCUPATION)[0],
            'income': random.choice(AdditionalInfo.INCOME)[0],
            'mspa_code': fake.lexify('????') + fake.numerify("####"),
            'company': fake.company(),
            'industry': random.choice(AdditionalInfo.INDUSTRY)[0],
            'car_cost': random.choice(AdditionalInfo.CAR_COST)[0],
            'car_model': fake.word(),
            'laptop_model': fake.word(),
            'mobile_model': fake.word(),
        }
        response = self.client.post(reverse('auditor:additional_info_view'), input_data, format="json")
        self.assertEqual(response.status_code, 200)
        for k,v in input_data.items():
            self.assertEqual(v, response.data.get(k))

        # re check if the GET end point is serving the data correctly
        response = self.client.get(reverse('auditor:additional_info_view'))
        self.assertEqual(response.status_code, 200)
        for k,v in input_data.items():
            self.assertEqual(v, response.data.get(k))
