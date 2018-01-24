import datetime

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User, Group
from django.core import mail
from django.utils import timezone
from django.conf import settings

from faker import Faker

from registration.models import Verification, GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

fake = Faker()

test_email_switches = {
    "NOTIFICATION_EMAIL": False,
    "VERIFICATION_EMAIL": True,
    "PRE_REMINDER_EMAIL": False,
    "ON_REMINDER_EMAIL": False,
    "POST_REMINDER_EMAIL": False,
    "WELCOME_EMAIL": False,
    "OPPORTUNITY_EMAIL": False,
}

class ForgotPasswordAPITestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.u = User.objects.create_user(username=self.email, email=self.email, password=fake.password())
        self.u.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        self.u.save()
        ProfileInfo.objects.create(user=self.u, mobile_number=self.mobile)

    def setup_verification(self, is_verified=True):
        self.verification = Verification.objects.create(
            user=self.u,
            activation_key=fake.lexify("?????????????????????????"),
            is_verified=is_verified,
            key_expires=timezone.now() + datetime.timedelta(days=2)
        )

    def test_normal_forgot_password_flow(self):
        self.setup_verification()

        new_pwd = fake.password()

        response = self.client.post(reverse('registration:password_reset'), {
            "email": self.email,
        })

        self.assertRedirects(response, reverse('registration:password_reset_done'), status_code=302, target_status_code=200)

        # check if email is sent
        self.assertEqual(len(mail.outbox), 1)
        reg_mail = mail.outbox[0]
        self.assertEqual(reg_mail.to[0], self.email)

        # get the unique password reset link
        pwd_reset_confirm_link = reverse('registration:password_reset_confirm', kwargs={
            "token": response.context[0]['token'],
            "uidb64": response.context[0]['uid'],
        })

        # click the password reset link
        response = self.client.get(pwd_reset_confirm_link)
        # check if the reset form loads correctly
        self.assertEqual(response.status_code, 200)

        # submit the form with the new password
        response = self.client.post(pwd_reset_confirm_link, {
            "new_password1": new_pwd,
            "new_password2": new_pwd,
        })

        self.assertRedirects(response, reverse('registration:password_reset_complete'), status_code=302, target_status_code=200)

        # test logging in with the newly changed password
        response = self.client.post(reverse('registration:login'), {
            "username": self.email,
            "password": new_pwd,
        })
        self.assertRedirects(response, settings.FRONTEND_CONFIG["AUDITOR"]["LOGIN_SUCCESS_REDIRECT_URL"], status_code=302, target_status_code=200, fetch_redirect_response=False)
