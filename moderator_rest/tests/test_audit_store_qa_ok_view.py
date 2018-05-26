from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from guardian.shortcuts import assign_perm

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from audit.models import AuditCycle
from audit_store.models import AuditStore
from auditor.models import ProfileInfo
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MODERATOR

fake = Faker()

class AuditStoreIdQAOKTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User,
                                         username=self.email,
                                         email=self.email,
                                         password=make_password(self.password),
                                         groups=[self.moderator_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_sets_status_to_pm_review(self):
        audit_store = mommy.make(AuditStore,
                                 status=AuditStore.SUBMITTED,
                                 audit__audit_cycle__status=AuditCycle.ACTIVE,
                                 user=self.auditor_user,
                                 qa_rating=AuditStore.GOOD,
                                 )
        assign_perm('moderator_manage', self.moderator_user, audit_store)

        self.login()

        response = self.client.post(reverse('moderator:audit_store_id_qa_ok_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.PM_REVIEW)

    def test_post_returns_404_when_not_assigned(self):
        audit_store = mommy.make(AuditStore,
                                 status=AuditStore.SUBMITTED,
                                 audit__audit_cycle__status=AuditCycle.ACTIVE,
                                 user=self.auditor_user,
                                 qa_rating=AuditStore.GOOD,
                                 )

        self.login()

        response = self.client.post(reverse('moderator:audit_store_id_qa_ok_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 404)

    def test_post_raises_when_report_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore,
                                 status=AuditStore.ACKNOWLEDGED,
                                 audit__audit_cycle__status=AuditCycle.ACTIVE,
                                 user=self.auditor_user,
                                 qa_rating=AuditStore.GOOD,
                                 )
        assign_perm('moderator_manage', self.moderator_user, audit_store)

        self.login()

        response = self.client.post(reverse('moderator:audit_store_id_qa_ok_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 400)
