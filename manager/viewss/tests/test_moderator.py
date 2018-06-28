from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from audit_store.models import AuditStore
from registration.models import GROUP_NAME_MODERATOR, GROUP_NAME_MANAGER

fake = Faker()

class AuditStoreModeratorAssignTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User,
                                         username="moderator@foobar.com",
                                         email="moderator@foobar.com",
                                         groups=[self.moderator_group])

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_assigns_audit_store(self):
        audit_store = mommy.make(AuditStore, user__email=fake.email())
        self.login()

        response = self.client.post(reverse('manager:audit_store_moderator_assign_view', kwargs = {
            'audit_store_id': audit_store.id,
        }), {
            'user_id': self.moderator_user.id,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_to_moderator"], [self.moderator_user.id])

    def test_delete_revokes_audit_store(self):
        audit_store = mommy.make(AuditStore, user__email=fake.email())
        self.login()

        response = self.client.delete(reverse('manager:audit_store_moderator_assign_view', kwargs = {
            'audit_store_id': audit_store.id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_to_moderator"], [])
