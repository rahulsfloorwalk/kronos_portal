from model_mommy import mommy

from django.contrib.auth.models import Group, User
from django.test import TestCase
from audit_store.models import AuditStore
from notify.service import mail_reminders
from registration.models import GROUP_NAME_AGENCY

class MailRemindersTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                      groups=[self.agency_group])

    def test_send_reminder_for_audit_store_returns_without_sending_mail(self):
        audit_store = mommy.make(AuditStore, user=self.agency_user, status=AuditStore.ACKNOWLEDGED)
        with self.assertLogs(logger='notify.service.mail_reminders', level='INFO') as log_check:
            mail_reminders.send_reminder_for_audit_store(audit_store.id, "PRE")
            self.assertIn("INFO:notify.service.mail_reminders:skipping reminder email for agency with user id " + str(audit_store.user.id), log_check.output)
