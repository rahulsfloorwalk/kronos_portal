import logging
import random
import string

from faker import Faker

from django.test import TestCase

from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo
from registration.backends import CaseInsensitiveModelBackend

fake = Faker()
logger = logging.getLogger(__name__)

class CaseInsensitiveModelBackendTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.mobile = ''.join(random.choice(string.digits) for i in range(10))
        self.password = fake.password()

        self.u = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.u.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        self.u.save()
        ProfileInfo.objects.create(user = self.u, mobile_number = self.mobile)


    def test_login_correct_username_password(self):
        """tests authenticate() with correct email and password"""
        backend = CaseInsensitiveModelBackend()
        user = backend.authenticate(self.email, self.password)

        self.assertIsNotNone(user)
        self.assertEqual(user.id, self.u.id)

    def test_login_correct_mobile_password(self):
        """tests authenticate() with correct mobile and password"""
        backend = CaseInsensitiveModelBackend()
        user = backend.authenticate(self.mobile, self.password)

        self.assertIsNotNone(user)
        self.assertEqual(user.id, self.u.id)

    def test_login_correct_upper_username_password(self):
        """tests authenticate() with correct uppercase username and correct password"""
        backend = CaseInsensitiveModelBackend()
        user = backend.authenticate(self.email.upper(), self.password)

        self.assertIsNotNone(user)
        self.assertEqual(user.id, self.u.id)

    def test_login_incorrect_username_password(self):
        """tests authenticate() with correct email and incorrect password"""
        backend = CaseInsensitiveModelBackend()
        user = backend.authenticate(self.email, "foo")

        self.assertIsNone(user)

    def test_login_incorrect_mobile_password(self):
        """tests authenticate() with correct mobile and incorrect password"""
        backend = CaseInsensitiveModelBackend()
        user = backend.authenticate(self.mobile, "foo")

        self.assertIsNone(user)

    def test_login_upper_username_incorrect_password(self):
        """tests authenticate() with correct mobile and incorrect password"""
        backend = CaseInsensitiveModelBackend()
        user = backend.authenticate(self.email.upper(), "foo")

        self.assertIsNone(user)
