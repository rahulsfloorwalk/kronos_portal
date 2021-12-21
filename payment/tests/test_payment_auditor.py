from datetime import date
from model_mommy import mommy
from model_mommy.recipe import Recipe
from audit_store.models import AuditStore

from django.test import TestCase

from django.contrib.auth.models import User, Group
from registration.models import GROUP_NAME_AUDITOR
from payment.models import Payment
from payment.service import payment_auditor as payment_service


class PaymentAuditorTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.audit_store_recipe = Recipe(
            AuditStore,
            audit_date=date(2017, 6, 5),
            user=self.auditor_user
        )
        self.audit_store_recipe1 = Recipe(
            AuditStore,
            audit_date=date(2017, 6, 6),
            user=self.auditor_user
        )

    def test_get_payment_summary_by_user(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ACCEPTED)
        mommy.make(Payment, audit_store=audit_store, amount=700, status=Payment.PAID, user=self.auditor_user)
        mommy.make(Payment, audit_store=audit_store, amount=500, status=Payment.PENDING, user=self.auditor_user)

        audit_store1 = self.audit_store_recipe1.make(status=AuditStore.ACCEPTED)
        mommy.make(Payment, audit_store=audit_store1, amount=900, status=Payment.PAID, user=self.auditor_user)

        summary = payment_service.get_payment_summary_by_user(self.auditor_user.id)

        self.assertEqual(500, summary['total_pending'])
        self.assertEqual(1600, summary['total_transfered'])
        self.assertEqual(2, summary['total_audits'])