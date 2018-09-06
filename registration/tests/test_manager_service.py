import logging

from faker import Faker

from django.test import TestCase

from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_MANAGER
from registration.service import manager

fake = Faker()
logger = logging.getLogger(__name__)


class ManagerServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):

        email = fake.email()
        passwd = fake.password()
        self.manager = User.objects.create_user(username=email, email=email, password=passwd)
        self.manager.groups.add(Group.objects.get(name=GROUP_NAME_MANAGER))
        self.manager.save()

    def test_find_auditor_by_id(self):
        user = manager.find_manager_by_user_id(self.manager.id)
        self.assertEqual(user.id, self.manager.id)
