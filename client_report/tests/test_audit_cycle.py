import string
import random

from django.urls import reverse

from django.contrib.auth.models import User, Group

from django.test import TestCase

from model_mommy import mommy

from faker import Faker

from questionnaire.models import Section
from client_report.service.audit_cycle import get_average_for_section
from registration.models import GROUP_NAME_CLIENT
from client.models import ClientUser, Client

fake = Faker()

class AuditCycleTestCase(TestCase):
    fixtures = ['groups', 'city', 'test_data/client_report_data.json']

    def setUp(self):
        self.section = Section.objects.get(pk=1)

    def test_get_average_for_section(self):
        section_average = get_average_for_section(self.section)
        self.assertEqual(section_average.get('value'), 36)
        self.assertEqual(section_average.get('color_code'), 1)
