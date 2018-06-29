from model_mommy import mommy
from audit_store.models import AuditStore

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound

from registration.models import GROUP_NAME_AGENCY, GROUP_NAME_MANAGER
from audit_store import service_agency as audit_store_service
from audit.models import AuditCycle


class AuditStoreServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                       groups=[self.agency_group])

    def test_find_audit_stores_for_agency_user_returns_list(self):
        status_list = AuditStore._ALL_STATUSES
        for status in status_list:
            mommy.make(AuditStore, status=status, user=self.agency_user,
                       audit__audit_cycle__status=AuditCycle.ACTIVE, qa_rating=AuditStore.AVERAGE)
        audit_stores = audit_store_service.find_audit_stores_for_agency_user(agency_user_id=self.agency_user.id)
        self.assertEqual(8, len(audit_stores))

    def test_find_by_user_id_for_agency_user_returns_audit_store(self):
        mock_audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                   audit__audit_cycle__status=AuditCycle.ACTIVE, qa_rating=AuditStore.AVERAGE)
        audit_store = audit_store_service.find_by_user_id_for_agency_user(mock_audit_store.id, self.agency_user.id)
        self.assertEqual(mock_audit_store, audit_store)


    def test_find_by_user_id_for_agency_user_raises_exception(self):
        withdrawn_audit_store = mommy.make(AuditStore, status=AuditStore.WITHDRAWN, user=self.agency_user,
                                      audit__audit_cycle__status=AuditCycle.ACTIVE, qa_rating=AuditStore.AVERAGE)
        self.assertRaises(ObjectNotFound, audit_store_service.find_by_user_id_for_agency_user, withdrawn_audit_store.id, self.agency_user.id)