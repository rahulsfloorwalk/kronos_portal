import logging
import random
import string

from faker import Faker

from django.test import TestCase

from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo
from registration.service import auditor

fake = Faker()
logger = logging.getLogger(__name__)

class AuditorServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.mobile = ''.join(random.choice(string.digits) for i in range(10))
        self.password = fake.password()

        self.u = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.u.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        self.u.save()
        ProfileInfo.objects.create(user=self.u, mobile_number=self.mobile)

        email = fake.email()
        passwd = fake.password()
        self.non_auditor = User.objects.create_user(username=email, email=email, password=passwd)
        self.non_auditor.groups.add(Group.objects.get(name=GROUP_NAME_MANAGER))
        self.non_auditor.save()

    def test_find_auditor_by_id(self):
        """tests find_auditor_by_id() with created user"""
        user = auditor.find_auditor_by_id(self.u.id)
        self.assertEqual(user.id, self.u.id)

    def test_default_is_active(self):
        """tests if auditor is active by default """
        self.assertTrue(self.u.is_active)

    def test_deactivate_auditor(self):
        """tests deactivate_auditor() with a user that is auditor"""
        user = auditor.deactivate_auditor(self.u.id)
        self.assertFalse(user.is_active)

    def test_activate_auditor(self):
        """tests activate_auditor() with a user that is auditor"""
        auditor.deactivate_auditor(self.u.id)
        user = auditor.activate_auditor(self.u.id)
        self.assertTrue(user.is_active)

    def test_find_auditor_by_id_with_non_auditor(self):
        """tests find_auditor_by_id() with a user that is not auditor"""
        with self.assertRaises(ObjectNotFound):
            auditor.find_auditor_by_id(self.non_auditor.id)

    def test_activate_auditor_with_non_auditor(self):
        """tests activate_auditor() with a user that is not auditor"""
        with self.assertRaises(ObjectNotFound):
            auditor.activate_auditor(self.non_auditor.id)

    def test_deactivate_auditor_with_non_auditor(self):
        """tests deactivate_auditor() with a user that is not auditor"""
        with self.assertRaises(ObjectNotFound):
            auditor.deactivate_auditor(self.non_auditor.id)
