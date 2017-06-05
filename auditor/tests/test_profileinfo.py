from datetime import date
import random
import string

from faker import Faker

from django.test import TestCase

from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_AUDITOR
from manager.models import City

from ..models import ProfileInfo

fake = Faker()

class ProfileInfoTestCase(TestCase):
    fixtures = ['groups', 'city']

    def create_complete_profile(self):
        return ProfileInfo.objects.create(
                user = self.u, 
                first_name = fake.first_name(), 
                last_name = fake.last_name(), 
                gender = random.choice(ProfileInfo.GENDER)[0],
                marital_status = random.choice(ProfileInfo.MARITAL_STATUS)[0],
                education = random.choice(ProfileInfo.EDUCATION)[0],
                mobile_number = ''.join(random.choices(string.digits, k=10)),
                date_of_birth = date.today(),
                address = fake.address(),
                pincode = fake.zipcode(),
                city = City.objects.get(name='Bangalore')
            )

    def setUp(self):
        email = fake.email()
        self.u = User.objects.create_user(username=email, email=email, password=fake.password())
        self.u.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        self.u.save()


    def test_profile_is_complete(self):
        """checks if ProfileInfo is complete"""

        p = self.create_complete_profile()

        self.assertTrue(p.is_complete())


    def test_profile_is_not_complete_for_first_name(self):
        """checks if ProfileInfo is not complete for first_name"""
        p = self.create_complete_profile()
        p.first_name = ''
        self.assertFalse(p.is_complete())

    def test_profile_is_not_complete_for_last_name(self):
        """checks if ProfileInfo is not complete for last_name"""
        p = self.create_complete_profile()
        p.last_name = ''
        self.assertFalse(p.is_complete())

    def test_profile_is_not_complete_for_education(self):
        """checks if ProfileInfo is not complete for education"""
        p = self.create_complete_profile()
        p.education = ''
        self.assertFalse(p.is_complete())

    def test_profile_is_not_complete_for_mobile_number(self):
        """checks if ProfileInfo is not complete for mobile_number"""
        p = self.create_complete_profile()
        p.mobile_number = ''
        self.assertFalse(p.is_complete())
