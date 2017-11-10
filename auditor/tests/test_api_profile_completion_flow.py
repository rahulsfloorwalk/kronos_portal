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

class ProfileCompletionAPITestCase(APITestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.password = "secret"
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.city = City.objects.get(pk=473)

        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com", groups=[self.auditor_group])
        self.auditor_user.set_password(self.password)
        self.auditor_user.save()
        self.profile = mommy.make(ProfileInfo, mobile_number=''.join(random.choice(string.digits) for i in range(10)), user=self.auditor_user)

        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com", groups=[self.manager_group])
        self.manager_user.set_password(self.password)
        self.manager_user.save()

        self.audit_recipe = Recipe(
                Audit,
                audit_cycle__status=AuditCycle.ACTIVE,
                audit_cycle__start_date=date(2017, 6, 1),
                audit_cycle__end_date=date(2017, 6, 20),
                store__location__city=self.city,
            )

        self.audit_recipe.make(_quantity=5)

    def test_profile_completion(self):
        ## login first 
        self.client.login(username="auditor@foobar.com", password=self.password)

        ## check if the endpoint returns success initially
        response = self.client.get('/auditor/profile_info')
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data.get("mobile_number"), 200)
        self.assertNotEqual(response.data.get("mobile_number"), "")

        ## try getting a list of available audits
        response = self.client.get('/auditor/audit')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(response.data), 1)

        ## fill out the profile information
        dob = date(1994,6,1).strftime("%Y-%m-%d")
        input_data = {
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'gender': random.choice(ProfileInfo.GENDER)[0],
            'education': random.choice(ProfileInfo.EDUCATION)[0],
            'date_of_birth': dob,
            'marital_status': random.choice(ProfileInfo.MARITAL_STATUS)[0],
            'address': fake.address(),
            'city_id': self.city.id,
            'pincode': fake.zipcode(),
        } 

        response = self.client.post('/auditor/profile_info', input_data, format="json")
        self.assertEqual(response.status_code, 200)
        for k,v in input_data.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))
        self.assertTrue(response.data.get("is_complete"))

        ## re check if the GET end point is serving the data correctly
        response = self.client.get('/auditor/profile_info')
        self.assertEqual(response.status_code, 200)
        for k,v in input_data.items():
            if isinstance(response.data.get(k), dict):
                self.assertEqual(v, response.data.get(k).get("id"))
            else:
                self.assertEqual(v, response.data.get(k))
        self.assertTrue(response.data.get("is_complete"))

        ## try getting a list of available audits after profile completion
        response = self.client.get('/auditor/audit')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)
