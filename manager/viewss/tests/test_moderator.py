from django.urls import reverse

from django.contrib.auth.models import User, Group

from model_mommy import mommy

from faker import Faker

from .utils import ManagerAPITestCase
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_MODERATOR

fake = Faker()

class AuditStoreModeratorAssignTestCase(ManagerAPITestCase):

    def setUp(self):
        super(AuditStoreModeratorAssignTestCase, self).setUp()
        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User,
                                         username="moderator@foobar.com",
                                         email="moderator@foobar.com",
                                         groups=[self.moderator_group])
        self.login()

    def test_post_assigns_audit_store(self):
        audit_store = mommy.make(AuditStore, user__email=fake.email())

        response = self.client.post(reverse('manager:audit_store_moderator_assign_view', kwargs = {
            'audit_store_id': audit_store.id,
        }), {
            'user_id': self.moderator_user.id,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_to_moderator"], [self.moderator_user.id])

    def test_delete_revokes_audit_store(self):
        audit_store = mommy.make(AuditStore, user__email=fake.email())

        response = self.client.delete(reverse('manager:audit_store_moderator_assign_view', kwargs = {
            'audit_store_id': audit_store.id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_to_moderator"], [])
