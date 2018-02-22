import logging

from faker import Faker

from django.test import TestCase

from agency.models import Agency

fake = Faker()
logger = logging.getLogger(__name__)

class AgencyTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setup_agency(self):
        self.agency = Agency.objects.create()

    def test_create(self):
        agency_name = fake.company()
        agency = Agency.objects.create_agency(agency_name, True)
        self.assertEqual(agency_name, agency.name)
        self.assertTrue(agency.agreement_accepted)
