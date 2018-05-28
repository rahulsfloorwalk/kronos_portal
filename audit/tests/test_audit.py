from django.test import TestCase
from django.contrib.auth.models import User

from faker import Faker
from model_mommy import mommy
from model_mommy.recipe import Recipe

from audit_store.models import AuditStore
from audit.models import Audit


fake = Faker()
class AuditCycleServiceTestCase(TestCase):

    def test_valid_report_count(self):

        audit = mommy.make(Audit)
        testuser = mommy.make(User, email=fake.email())
        recipe = Recipe(AuditStore, audit=audit, user=testuser)
        recipe.make(status=AuditStore.ASSIGNED)
        recipe.make(status=AuditStore.ACKNOWLEDGED)
        recipe.make(status=AuditStore.SUBMITTED)
        recipe.make(status=AuditStore.PM_REVIEW)
        recipe.make(status=AuditStore.COMPLETED)
        recipe.make(status = AuditStore.ACCEPTED)
        recipe.make(status=AuditStore.WITHDRAWN)
        recipe.make(status=AuditStore.FAILED)
        recipe.make(status=AuditStore.REJECTED)

        self.assertEqual(6, audit.valid_report_count())
