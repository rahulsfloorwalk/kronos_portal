import logging

from django.test import TestCase
from django.contrib.auth.models import User, Group

from faker import Faker
from model_mommy import mommy

from kronos.exceptions import AppLogicError

from auditor.models import ProfileInfo
from registration.models import MobileNumber, GROUP_NAME_AUDITOR
from registration.service import mobile_number_service

fake = Faker()
logger = logging.getLogger(__name__)

class MobileNumberServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        email = fake.email()
        self.u = User.objects.create_user(username=email, email=email, password=fake.password())
        self.u.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        self.u.save()

    def test_mobile_number_exists_where_number_does_not_exist(self):
        self.assertFalse(mobile_number_service.mobile_number_exists("8983484449"))

    def test_mobile_number_exists_where_number_exists_in_registration_mobilenumber(self):
        number = "8983484449"
        mommy.make(MobileNumber, mobile_number=number, is_verified=True, user=self.u)
        self.assertTrue(mobile_number_service.mobile_number_exists(number))

    def test_mobile_number_exists_where_number_exists_in_auditor_profileinfo(self):
        number = "8983484449"
        mommy.make(ProfileInfo, mobile_number=number, user=self.u)
        self.assertTrue(mobile_number_service.mobile_number_exists(number))

    def test_mobile_number_exists_where_number_exists_in_auditor_profileinfo_and_registration_mobilenumber(self):
        number = "8983484449"
        mommy.make(ProfileInfo, mobile_number=number, user=self.u)
        mommy.make(MobileNumber, mobile_number=number, is_verified=True, user=self.u)
        self.assertTrue(mobile_number_service.mobile_number_exists(number))

    def test_save_mobile_number_for_user_with_non_existing_mobile_number(self):
        number = "8983484449"
        mobile_number = mobile_number_service.save_mobile_number_for_user(self.u, number)
        self.assertEqual(mobile_number.mobile_number, number)
        self.assertFalse(mobile_number.is_verified)

    def test_save_mobile_number_for_user_where_number_exists_in_registration_mobile_number(self):
        number = "8983484449"
        mommy.make(MobileNumber, mobile_number=number, is_verified=True, user=self.u)
        with self.assertRaisesRegex(AppLogicError, "Mobile number already exists"):
            mobile_number_service.save_mobile_number_for_user(self.u, number)

    def test_save_mobile_number_for_user_where_number_exists_in_auditor_profileinfo(self):
        number = "8983484449"
        mommy.make(ProfileInfo, mobile_number=number, user=self.u)
        with self.assertRaisesRegex(AppLogicError, "Mobile number already exists"):
            mobile_number_service.save_mobile_number_for_user(self.u, number)
