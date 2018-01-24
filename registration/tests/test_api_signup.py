from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib import auth
from django.contrib.auth.models import User, Group
from django.core import mail

from faker import Faker

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER

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

class SignupAPITestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

    @override_settings(EMAIL_SWITCH = test_email_switches)
    def test_normal_signup_flow(self):
        # check if the form loads correctly
        response = self.client.get(reverse('registration:signup'))
        self.assertEqual(response.status_code, 200)

        # post to registration endpoint with correct data
        email = fake.email()
        pwd = fake.password()
        phone = fake.numerify("##########")
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": "",
        }, follow=True)

        # check for a redirect to signup success
        self.assertRedirects(response, reverse('registration:signup_success'), status_code=302, target_status_code=200)

        # check if email is sent
        self.assertEqual(len(mail.outbox), 1)
        reg_mail = mail.outbox[0]
        self.assertEqual(reg_mail.to[0], email)

        user = User.objects.get(email=email)

        # check if user has been added to auditor group
        self.assertEqual(user.groups.first(), self.auditor_group)

        # check if mobile number has been set correctly
        self.assertEqual(user.profileinfo.mobile_number, phone)

        # check if verification entry has been correctly created
        self.assertEqual(user.verification.is_verified, False)

        # click the verify link
        response = self.client.get(reverse('registration:activate', kwargs={
            "key": user.verification.activation_key
        }))

        # check for a redirect to the app
        self.assertRedirects(response, reverse("registration:login"), status_code=302, target_status_code=302)

        # check if the user was auto logged in
        self.assertTrue(auth.get_user(self.client).is_authenticated())

        # finally log the user out
        response = self.client.post(reverse("registration:logout"))
        self.assertRedirects(response, reverse("registration:login"), status_code=302, target_status_code=200)

