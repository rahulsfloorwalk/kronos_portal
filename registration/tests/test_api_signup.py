from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib import auth
from django.contrib.auth.models import User, Group
from django.core import mail

from faker import Faker

from auditor.models import ProfileInfo, AdditionalInfo
from registration.models import GROUP_NAME_AUDITOR
from registration.service import auditor

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

    def setup_auditor(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()
        self.referral_code = auditor.generate_ref_code(self.email, self.mobile)

        self.auditor = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.auditor.groups.add(Group.objects.get(name=GROUP_NAME_AUDITOR))
        self.auditor.save()
        ProfileInfo.objects.create(user=self.auditor, mobile_number=self.mobile)

        additional_info = AdditionalInfo(user_id=self.auditor.id)
        additional_info.referral_code = self.referral_code
        additional_info.save()

    @override_settings(EMAIL_SWITCH = test_email_switches)
    def test_normal_signup_flow(self):
        # check if the form loads correctly
        response = self.client.get(reverse('registration:signup'))
        # self.assertEqual(response.status_code, 200)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "https://auditor.floorwalk.in")

        # post to registration endpoint with correct data
        email = fake.email()
        pwd = fake.password()
        phone = fake.numerify("##########")
        dial_code = "+1" 
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": "",
            "tos_accept": True,
            "dial_code": dial_code,
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
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("registration:login"))
        # self.assertRedirects(response, reverse("registration:login"), status_code=302, target_status_code=200)

    def test_non_matching_passwords(self):

        # post to registration endpoint
        email = fake.email()
        pwd1 = fake.password()
        pwd2 = fake.password()
        phone = fake.numerify("##########")
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd1,
            "password2": pwd2,
            "referred_by": "",
            "tos_accept": True,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["password2"].errors), 1)

    def test_non_accepted_tos(self):

        # post to registration endpoint
        email = fake.email()
        pwd = fake.password()
        phone = fake.numerify("##########")
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": "",
            "tos_accept": False,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["tos_accept"].errors), 1)

    def test_invalid_mobile_number(self):

        # post to registration endpoint
        email = fake.email()
        pwd = fake.password()
        phone = fake.numerify("#########")
        dial_code = "+1"
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": "",
            "tos_accept": True,
            "dial_code": dial_code
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        # self.assertEqual(len(response.context["form"]["phone"].errors), 1)

    def test_invalid_email(self):

        # post to registration endpoint
        email = fake.lexify("?????")
        pwd = fake.password()
        phone = fake.numerify("##########")
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": "",
            "tos_accept": True,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["username"].errors), 1)

    def test_pre_existing_email(self):
        # setup an existing auditor
        self.setup_auditor()

        # post to registration endpoint
        email = self.email
        pwd = fake.password()
        phone = fake.numerify("##########")
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": "",
            "tos_accept": True,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["username"].errors), 1)

    def test_pre_existing_phone(self):
        # setup an existing auditor
        self.setup_auditor()

        # post to registration endpoint
        email = fake.email()
        pwd = fake.password()
        phone = self.mobile
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": "",
            "tos_accept": True,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["phone"].errors), 1)

    def test_valid_referral(self):
        # setup an existing auditor
        self.setup_auditor()

        # post to registration endpoint
        email = fake.email()
        pwd = fake.password()
        phone = fake.numerify("##########")
        referred_by = self.referral_code
        dial_code = "+1"
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": referred_by,
            "tos_accept": True,
            "dial_code": dial_code
        }, follow=True)

        # check for a redirect to signup success
        self.assertRedirects(response, reverse('registration:signup_success'), status_code=302, target_status_code=200)

    def test_invalid_referral(self):
        # post to registration endpoint
        email = fake.email()
        pwd = fake.password()
        phone = fake.numerify("##########")
        referred_by = fake.lexify(fake.numerify("????####"))
        response = self.client.post(reverse('registration:signup'), {
            "username": email,
            "phone": phone,
            "password1": pwd,
            "password2": pwd,
            "referred_by": referred_by,
            "tos_accept": True,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["referred_by"].errors), 1)
