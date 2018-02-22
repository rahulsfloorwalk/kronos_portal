from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AGENCY

from agency.models import Agency, AgencyUser
from manager.models import City

fake = Faker()

class AgencyPresencePresentViewTestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.city = City.objects.get(pk=345)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency_user = AgencyUser.objects.create(agency=self.agency, user=self.user, full_name=fake.name())
        self.user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.user.save()

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_post_sets_agency_presence(self):
        self.setup_agency()
        self.setup_agency_user()
        self.login()

        url = reverse('agency_rest:agency_presence_present_view', kwargs={
            "city_id": self.city.id
        })

        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data.items(), {
            "present": True,
            "city_id": self.city.id,
            "agency_id": self.agency.id,
        }.items())

    def test_delete_unsets_agency_presence(self):
        self.setup_agency()
        self.setup_agency_user()
        self.login()

        url = reverse('agency_rest:agency_presence_present_view', kwargs={
            "city_id": self.city.id
        })

        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data.items(), {
            "present": False,
            "city_id": self.city.id,
            "agency_id": self.agency.id,
        }.items())

