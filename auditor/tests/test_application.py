from datetime import date

from django.test import TestCase

from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_AUDITOR
from manager.models import City

from ..models import ProfileInfo

class AuditApplicationTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.u = User.objects.create(username="auditor@foobar.com", email="auditor@foobar.com", password="top_secret")
        self.u.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        self.u.save()
