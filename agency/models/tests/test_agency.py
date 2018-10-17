import logging

from faker import Faker

from django.test import TestCase

from agency.models import Agency
from model_mommy import mommy

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

    def test_is_bank_details_complete_returns_true(self):
        agency = mommy.make(Agency, account_number='5000050000', ifsc_code='SBIN0008238', account_holder_name='foobar')
        self.assertTrue(agency.is_bank_details_complete())

    def test_is_bank_details_complete_returns_false_when_account_number_incomplete(self):
        agency = mommy.make(Agency, ifsc_code='SBIN0008238', account_holder_name='foobar')
        self.assertFalse(agency.is_bank_details_complete())

    def test_is_bank_details_complete_returns_false_when_ifsc_incomplete(self):
        agency = mommy.make(Agency, account_number='5000050000', account_holder_name='foobar')
        self.assertFalse(agency.is_bank_details_complete())

    def test_is_bank_details_complete_returns_false_when_ifsc_invalid(self):
        agency = mommy.make(Agency, account_number='5000050000', ifsc_code='asdf', account_holder_name='foobar')
        self.assertFalse(agency.is_bank_details_complete())

    def test_is_bank_details_complete_returns_false_when_account_holders_name_incomplete(self):
        agency = mommy.make(Agency, account_number='5000050000', ifsc_code='SBIN0008238')
        self.assertFalse(agency.is_bank_details_complete())
