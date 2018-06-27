from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from audit.models import Audit, AuditCycle
from audit_store.models import AuditStore
from auditor.models import ProfileInfo
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

fake = Faker()


class AuditStoreByAuditCycleTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_get_retrieves_all_audit_stores(self):
        audit_cycle = mommy.make(AuditCycle)
        mommy.make(AuditStore, user=self.auditor_user, audit__audit_cycle=audit_cycle, _quantity=5)
        self.login()

        response = self.client.get(reverse('manager:audit_store_by_audit_cycle_view', kwargs = {
            'audit_cycle_id': audit_cycle.id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)
        for report in response.data:
            self.assertEqual(Audit.objects.get(pk=report["audit"]).audit_cycle_id, audit_cycle.id)


class AuditStoreByAuditTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_get_retrieves_all_audit_stores(self):
        audit = mommy.make(Audit)
        mommy.make(AuditStore, user=self.auditor_user, audit=audit, _quantity=5)
        self.login()

        response = self.client.get(reverse('manager:audit_store_by_audit_id_view', kwargs = {
            'audit_id': audit.id,
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)
        for report in response.data:
            self.assertEqual(report["audit"], audit.id)


class AuditStoreIdQARatingTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_sets_rating(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user)
        rating = AuditStore.GOOD
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_qa_rating_view', kwargs = {
            'audit_store_id': audit_store.id
        }), {
            "qa_rating": rating
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["qa_rating"], rating)


class AuditStoreIdSubmitTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_submit_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.SUBMITTED)


class AuditStoreIdRevertSubmitTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_acknowledged(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_unsubmit_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.ACKNOWLEDGED)


class AuditStoreIdQAOKTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_qa_ok_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.PM_REVIEW)


class AuditStoreIdPMRevertTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_pm_revert_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.SUBMITTED)


class AuditStoreIdCompleteTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_completed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_complete_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.COMPLETED)


class AuditStoreIdRevertCompleteTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_uncomplete_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.PM_REVIEW)


class AuditStoreIdFailTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_failed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_fail_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.FAILED)


class AuditStoreIdWithdrawTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_withdrawn(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_withdraw_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.WITHDRAWN)


class AuditStoreIdRejectTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def login(self):
        self.client.login(username=self.email, password=self.password)

    def test_post_changes_status_to_pm_rejected(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user, qa_rating=AuditStore.GOOD)
        self.login()

        response = self.client.post(reverse('manager:audit_store_id_reject_view', kwargs = {
            'audit_store_id': audit_store.id
        }))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], AuditStore.REJECTED)
