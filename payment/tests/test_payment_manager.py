from datetime import date
from model_mommy import mommy
from model_mommy.recipe import Recipe
from audit_store.models import AuditStore

from django.test import TestCase

from django.contrib.auth.models import User, Group
from kronos.exceptions import AppLogicError
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo, BankInfo
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

    def test_add_payment_on_audit_store_accepted(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ACCEPTED)
        payment_service.add_payment_on_audit_store_accepted(audit_store.id, 500, self.manager_user)
        payments = Payment.objects.filter(user=self.auditor_user)
        self.assertEqual(1, len(payments))
        self.assertEqual(500, payments[0].amount)

    def test_pay_payment(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ACCEPTED)
        auditor_bank_info = mommy.make(BankInfo, user=self.auditor_user, account_holder_name = "foobar", account_number = "123454321", ifsc_code = "SBIN0001", pan_number = "ADSFB780Y")
        payment = mommy.make(Payment, audit_store=audit_store, status=Payment.PENDING, user=self.auditor_user)
        paid_payment = payment_service.pay(payment.id, self.manager_user)
        self.assertEqual(paid_payment.status, Payment.PAID)

    def test_pay_payment_exception(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ACCEPTED)
        payment = mommy.make(Payment, audit_store=audit_store, status=Payment.PENDING, user=self.auditor_user)
        # paid_payment = payment_service.pay(payment.id, self.manager_user)
        self.assertRaises(AppLogicError, payment_service.pay, payment.id, self.manager_user)

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

    def test_consolidate_by_user(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ACCEPTED)
        p1 = mommy.make(Payment, audit_store=audit_store, amount=500, status=Payment.PENDING, user=self.auditor_user)
        p2 = mommy.make(Payment, audit_store=audit_store, amount=500, status=Payment.PENDING, user=self.auditor_user)
        p3 = mommy.make(Payment, audit_store=audit_store, amount=500, status=Payment.PENDING, user=self.auditor_user)
        consolidated_payments = payment_service.consolidate_by_user([p1, p2, p3])
        self.assertEqual(1, len(consolidated_payments))
        self.assertEqual(1500, consolidated_payments[0].amount)

