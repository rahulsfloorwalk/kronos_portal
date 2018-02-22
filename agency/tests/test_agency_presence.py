import logging
import random
import string

from faker import Faker
from model_mommy import mommy

from django.test import TestCase

from django.contrib.auth.models import User, Group

from manager.models import City
from registration.models import GROUP_NAME_AGENCY
from agency.models import Agency, AgencyUser, AgencyPresence

fake = Faker()
logger = logging.getLogger(__name__)

class AgencyPresenceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setup_agency(self):
        self.agency = Agency.objects.create()

    def setup_agency_user(self):
        self.city = City.objects.get(pk=345)

        self.email = fake.email()
        self.mobile = ''.join(random.choice(string.digits) for i in range(10))
        self.password = fake.password()

        self.user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency_user = AgencyUser.objects.create(agency=self.agency, user=self.user, full_name=fake.name())
        self.user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.user.save()

    def test_find_by_user_and_state(self):
        self.setup_agency()
        self.setup_agency_user()

        state_code = "IN-MH"

        expected_presences = mommy.make(AgencyPresence, agency=self.agency, city__state=state_code, _quantity=5)
        actual_presences = AgencyPresence.objects.find_by_user_and_state(self.user, state_code)

        self.assertEqual(set(expected_presences), set(actual_presences))

    def test_find_by_user_and_city(self):
        self.setup_agency()
        self.setup_agency_user()

        expected_presence = AgencyPresence.objects.create(city=self.city, agency=self.agency)
        actual_presence = AgencyPresence.objects.find_by_user_and_city(self.user, city=self.city)

        self.assertEqual(expected_presence, actual_presence)

    def test_find_by_user_and_city_without_creating(self):
        self.setup_agency()
        self.setup_agency_user()

        presence = AgencyPresence.objects.find_by_user_and_city(self.user, city=self.city)
        self.assertFalse(presence.present)
        self.assertEqual(presence.agency, self.agency)
        self.assertEqual(presence.city, self.city)

    def test_find_by_agency_and_city(self):
        self.setup_agency()
        self.setup_agency_user()

        expected_presence = AgencyPresence.objects.create(city=self.city, agency=self.agency)
        actual_presence = AgencyPresence.objects.find_by_agency_and_city(self.agency, city=self.city)

        self.assertEqual(expected_presence, actual_presence)

    def test_set_presence_true(self):
        self.setup_agency()
        self.setup_agency_user()

        presence = AgencyPresence.objects.create(city=self.city, agency=self.agency)
        presence.set_presence(True)
        self.assertTrue(presence.present)
