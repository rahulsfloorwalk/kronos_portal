from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from faker import Faker

from registration.models import GROUP_NAME_AUDITOR

from ..models import ProfileInfo

fake = Faker()

class MobileNumberAPITestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.u = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.u.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        self.u.save()
        ProfileInfo.objects.create(user=self.u, mobile_number=None)

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_mobile_number(self):
        self.login()

        mobile_number = fake.numerify("##########")

        profile_url = reverse('auditor:profile_info_view')
        mobile_url = reverse('auditor:mobile_number_view')

        # check if the endpoint returns no phone number initially
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data.get("is_complete"))
        self.assertIsNone(response.data.get("mobile_number"))

        # set the mobile number
        response = self.client.post(mobile_url, {
            "mobile_number": mobile_number,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get("mobile_number"), mobile_number)

        # retry setting the mobile number
        response = self.client.post(mobile_url, {
            "mobile_number": fake.numerify("##########"),
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get("mobile_number"), mobile_number)

        # check if the profile endpoint returns correct data
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data.get("is_complete"))
        self.assertIsNotNone(response.data.get("mobile_number"))

