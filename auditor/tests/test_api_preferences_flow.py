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

class PreferencesAPITestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.password = "secret"

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.auditor_user = mommy.make(User, username=self.email, email=self.email, groups=[self.auditor_group])
        self.auditor_user.set_password(self.password)
        self.auditor_user.save()
        self.profile = mommy.make(ProfileInfo, mobile_number=''.join(random.choice(string.digits) for i in range(10)), user=self.auditor_user)

    def test_preferences_flow(self):
        # login first
        self.client.login(username=self.email, password=self.password)

        prefs_url = reverse('auditor:preferences_view')

        # check if the endpoint returns the correct defaults initially
        response = self.client.get(prefs_url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get("receive_new_opportunities_email"))

        # change the Preferences
        input_prefs = {
            'receive_new_opportunities_email': fake.pybool(),
        }
        response = self.client.post(prefs_url, input_prefs, format="json")
        self.assertEqual(response.status_code, 200)
        for k,v in input_prefs.items():
            self.assertEqual(v, response.data.get(k))

        # re check if the GET end point is serving the data correctly
        response = self.client.get(prefs_url)
        self.assertEqual(response.status_code, 200)
        for k,v in input_prefs.items():
            self.assertEqual(v, response.data.get(k))

