from faker import Faker
from model_mommy import mommy

from rest_framework.test import APITestCase

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password
from client.models import Client, ClientUser

from registration.models import GROUP_NAME_CLIENT, GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

fake = Faker()

class ClientAPITestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()
        self.name = fake.name()

        self.client_group = Group.objects.get(name=GROUP_NAME_CLIENT)
        self.client_obj = mommy.make(Client, name = self.name, email = self.email, is_auto_signup = True)
        self.user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password), groups=[self.client_group])
        self.client_user = mommy.make(ClientUser, client = self.client_obj, user = self.user, full_name = self.name)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def create_auditor(self):
        auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        auditor_email = fake.email()
        auditor_user = mommy.make(User, username=auditor_email, email=auditor_email, groups=[auditor_group])
        mommy.make(ProfileInfo, user=auditor_user, auditor_rating=ProfileInfo.EXCELLENT)
        return auditor_user
