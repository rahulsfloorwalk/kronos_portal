from model_mommy import mommy

from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from faker import Faker
from manager.models import ManagerProfileInfo,City
from auditor.models import ProfileInfo

fake = Faker()
class AuditorViewTestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, groups=[self.manager_group])
        self.manager_user.set_password(self.password)
        self.manager_user.save()

        self.city = mommy.make(City, country="India")
        self.manager_profile = mommy.make(ManagerProfileInfo,user=self.manager_user)
        self.manager_profile.allowed_countries = ["India"]
        self.manager_profile.save()
        
        self.create_auditors()

    def create_auditors(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        for i in range(10):
            email = fake.email()
            auditor = mommy.make(User, username=email, email=email, is_active=True, groups=[self.auditor_group])

            mommy.make(ProfileInfo,user=auditor,city=self.city)
    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_auditor_search_returns_correct_count_per_page(self):
        self.login()
        response = self.client.get(reverse('manager:auditor_view'))
        self.assertEqual(200, response.status_code)
        self.assertEqual(10, response.data['count'])
        self.assertEqual(10, len(response.data['results']))

    # def test_auditor_search_returns_auditors_in_decreasing_date_joined_order(self):
    #     self.login()
    #     response = self.client.get(reverse('manager:auditor_view'))
    #     self.assertEqual(200, response.status_code)
    #     auditors = response.data['results']
    #     for i in range(199):
    #         self.assertGreater(auditors[i]['date_joined'], auditors[i + 1]['date_joined'])


