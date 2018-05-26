from model_mommy import mommy
from audit_store.models import AuditStore

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import AppLogicError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from questionnaire.models import Question
from auditor.models import ProfileInfo
from audit_store import service
from audit.models import AuditCycle


class AuditStoreServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_complete_changes_status_from_pm_review_to_completed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user, audit__audit_cycle__status=AuditCycle.ACTIVE, qa_rating=AuditStore.AVERAGE)
        audit_store = service.complete(audit_store.id, self.manager_user)

        self.assertEqual(audit_store.status, AuditStore.COMPLETED)

    def test_complete_raises_when_report_is_not_completable(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        mommy.make(Question, section__audit_cycle=audit_cycle)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, status=AuditStore.SUBMITTED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="Report is not complete."):
            service.complete(audit_store.id, self.manager_user)

    def test_complete_raises_when_report_is_not_qa_rated(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user=self.auditor_user, qa_rating=None)
        with self.assertRaises(AppLogicError, msg="Report is not rated. Please rate the report before completing."):
            service.complete(audit_store.id, self.manager_user)

    def test_complete_raises_when_report_status_is_not_submitted(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user, qa_rating=AuditStore.AVERAGE)
        with self.assertRaises(AppLogicError, msg="audit store cannot be completed now"):
            service.complete(audit_store.id, self.manager_user)

    def test_fail_changes_status_to_failed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        audit_store = service.fail(audit_store.id, self.manager_user)
        self.assertEqual(audit_store.status, AuditStore.FAILED)

    def test_fail_raises_when_status_is_completed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="audit store cannot be failed now"):
            service.fail(audit_store.id, self.manager_user)

    def test_uncomplete_changes_status_from_completed_to_pm_review(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.COMPLETED, user=self.auditor_user)
        audit_store = service.uncomplete(audit_store.id, self.manager_user)
        self.assertEqual(audit_store.status, AuditStore.PM_REVIEW)

    def test_uncomplete_raises_when_status_is_not_completed(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.PM_REVIEW, user=self.auditor_user)
        with self.assertRaises(AppLogicError, msg="audit store cannot be uncompleted now"):
            service.uncomplete(audit_store.id, self.manager_user)
