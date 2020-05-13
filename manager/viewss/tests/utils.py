from faker import Faker
from model_mommy import mommy

from rest_framework.test import APITestCase

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

fake = Faker()

class ManagerAPITestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def create_auditor(self):
        auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        auditor_email = fake.email()
        auditor_user = mommy.make(User, username=auditor_email, email=auditor_email, groups=[auditor_group])
        mommy.make(ProfileInfo, user=auditor_user, auditor_rating=ProfileInfo.EXCELLENT)
        return auditor_user
