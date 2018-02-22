from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AGENCY

from agency.models import Agency, AgencyUser, AgencyPresence
from manager.models import City

fake = Faker()

class AgencyPresenceByStateViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

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

    def test_get_fetches_agency_presences_for_a_state(self):
        self.setup_agency()
        self.setup_agency_user()
        self.login()

        state_code = "IN-MH"

        presences = mommy.make(AgencyPresence, agency=self.agency, city__state=state_code, _quantity=2)

        url = reverse("agency_rest:agency_presence_by_state_view", kwargs={
            "state_code": "IN-MH"
        })

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), len(presences))
        for r in response.data:
            self.assertEqual(r["agency_id"], self.agency.id)
            self.assertEqual(state_code, City.objects.get(pk=r["city_id"]).state)
