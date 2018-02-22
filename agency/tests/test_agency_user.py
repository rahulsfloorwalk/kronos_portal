import logging
import random
import string

from faker import Faker

from django.test import TestCase

from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_AGENCY
from agency.models import Agency, AgencyUser

fake = Faker()
logger = logging.getLogger(__name__)

class AgencyUserTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setup_agency(self):
        self.agency = Agency.objects.create()

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = ''.join(random.choice(string.digits) for i in range(10))
        self.password = fake.password()

        self.user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency_user = AgencyUser.objects.create(agency=self.agency, user=self.user, full_name=fake.name())
        self.user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.user.save()

    def test_find_by_user_id(self):
        self.setup_agency()
        self.setup_agency_user()

        agency_user = AgencyUser.objects.find_by_user_id(self.user.id)
        self.assertEqual(self.agency_user, agency_user)

    def test_create_agency_user(self):
        self.setup_agency()

        name = fake.name()
        email = fake.email()
        password = fake.password()

        agency_user = AgencyUser.objects.create_agency_user(email, password, self.agency, name)

        self.assertEqual(agency_user.full_name, name)
        self.assertEqual(agency_user.user.email, email)
        self.assertEqual(agency_user.user.username, email)
        self.assertEqual(agency_user.agency, self.agency)
