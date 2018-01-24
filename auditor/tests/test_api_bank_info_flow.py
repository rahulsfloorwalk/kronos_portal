from datetime import date
import string
import random

from django.test import TestCase

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase, APIClient

from model_mommy import mommy
from model_mommy.recipe import Recipe, foreign_key

from faker import Faker

from kronos.exceptions import AppLogicError, ObjectNotFound
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

from ..models import ProfileInfo

from audit.models import AuditCycle, Audit
from auditor.models import AuditApplication
from audit_store.models import AuditStore
from manager.models import City

fake = Faker()

class BankInfoAPITestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.password = "secret"

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com", groups=[self.auditor_group])
        self.auditor_user.set_password(self.password)
        self.auditor_user.save()
        self.profile = mommy.make(ProfileInfo, mobile_number=''.join(random.choice(string.digits) for i in range(10)), user=self.auditor_user)

    def test_bank_info_flow(self):
        ## login first 
        self.client.login(username="auditor@foobar.com", password=self.password)

        ## check if the endpoint returns success initially
        response = self.client.get('/auditor/bank_info')
        self.assertEqual(response.status_code, 200)

        ## fill out the bank info
        input_data = {
            'bank_name': fake.company(),
            'account_holder_name': fake.name(),
            'account_number': fake.numerify(text="###############"),
            'ifsc_code': fake.lexify(text="???????") + fake.numerify(text="######"),
            'pan_number': fake.lexify(text="????") + fake.numerify(text="####"),
        } 
        response = self.client.post('/auditor/bank_info', input_data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get("is_complete"))
        for k,v in input_data.items():
            self.assertEqual(v, response.data.get(k))

        ## re check if the GET end point is serving the data correctly
        response = self.client.get('/auditor/bank_info')
        self.assertEqual(response.status_code, 200)
        for k,v in input_data.items():
            self.assertEqual(v, response.data.get(k))

