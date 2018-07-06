import logging
import random
import string

from faker import Faker

from django.test import TestCase

from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound

from registration.models import GROUP_NAME_AGENCY, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo
from registration.service import agency as agency_registration_service

fake = Faker()
logger = logging.getLogger(__name__)

class AgencyServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.mobile = ''.join(random.choice(string.digits) for i in range(10))
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

        email = fake.email()
        passwd = fake.password()
        self.non_agency_user = User.objects.create_user(username=email, email=email, password=passwd)
        self.non_agency_user.groups.add(Group.objects.get(name=GROUP_NAME_MANAGER))
        self.non_agency_user.save()

    def test_find_auditor_by_id(self):
        """tests find_auditor_by_id() with created user"""
        user = agency_registration_service.find_agency_user_by_user_id(self.agency_user.id)
        self.assertEqual(user.id, self.agency_user.id)

    def test_find_auditor_by_id_with_non_auditor(self):
        """tests find_auditor_by_id() with a user that is not agency user"""
        with self.assertRaises(ObjectNotFound):
            agency_registration_service.find_agency_user_by_user_id(self.non_agency_user.id)