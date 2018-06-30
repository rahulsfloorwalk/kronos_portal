from model_mommy import mommy

from django.test import TestCase
from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_AGENCY
from registration.models import GROUP_NAME_MANAGER
from questionnaire.service import section as section_service
from questionnaire.models import Section
from audit_store.models import AuditStore
from audit.models import AuditCycle

class SectionTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.client_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.agency_user = mommy.make(User, username="agency_user@foobar.com", email="agency_user@foobar.com",
                                      groups=[self.client_group])

    def test_find_by_audit_store_for_agency_returns_section_list(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=audit_cycle)
        for i in range(5):
            mommy.make(Section, audit_cycle=audit_cycle)
        sections = section_service.find_by_audit_store_for_agency(audit_store.id, self.agency_user.id)
        self.assertEqual(5, len(sections))