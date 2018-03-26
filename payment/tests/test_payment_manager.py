from datetime import date
from model_mommy import mommy
from model_mommy.recipe import Recipe
from audit_store.models import AuditStore

from django.test import TestCase

from django.contrib.auth.models import User, Group
from kronos.exceptions import AppLogicError
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo
from payment.models import Payment
from audit_store import service as audit_store_service
from payment.service import payment_manager as payment_service


class PaymentManagerTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)
        self.audit_store_recipe = Recipe(
            AuditStore,
            audit_date=date(2017, 6, 5),
            user=self.auditor_user
        )

    def test_fail_payment(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ACCEPTED)
        payment = mommy.make(Payment, audit_store=audit_store, status=Payment.PAID, user=self.auditor_user)
        failed_payment = payment_service.fail(payment.id, self.manager_user)
        self.assertEqual(failed_payment.status, Payment.FAILED)
        self.assertEqual(1, len(payment_service.find_by_audit_store(audit_store).filter(status=Payment.PENDING)))



    def test_fail_payment_exception(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ACCEPTED)
        payment = mommy.make(Payment, audit_store=audit_store, status=Payment.PENDING, user=self.auditor_user)
        self.assertRaises(AppLogicError, payment_service.fail, payment.id, self.manager_user)
