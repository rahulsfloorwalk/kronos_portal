from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib import auth
from django.contrib.auth.models import User, Group
from django.core import mail

from model_mommy import mommy
from faker import Faker

from agency.models import Agency, AgencyUser
from registration.models import GROUP_NAME_AGENCY
from registration.models import MobileNumber

fake = Faker()

test_email_switches = {
    "NOTIFICATION_EMAIL": False,
    "VERIFICATION_EMAIL": False,
    "PRE_REMINDER_EMAIL": False,
    "ON_REMINDER_EMAIL": False,
    "POST_REMINDER_EMAIL": False,
    "WELCOME_EMAIL": False,
    "OPPORTUNITY_EMAIL": False,
    "AGENCY_VERIFICATION_EMAIL": True,
}

class AgencySignupAPITestCase(TestCase):
    fixtures = ['groups', 'city']
    __signup_url = reverse('registration:agency_signup')

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile_number = fake.numerify("##########")
        self.password = fake.password()

        self.agency = Agency.objects.create(name=fake.company())

        self.user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        mommy.make(MobileNumber, mobile_number=self.mobile_number, user=self.user)
        self.user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user = AgencyUser.objects.create(agency=self.agency, user=self.user, full_name=fake.name())

    @override_settings(EMAIL_SWITCH = test_email_switches)
    def test_normal_signup_flow(self):
        # check if the form loads correctly
        response = self.client.get(self.__signup_url)
        self.assertEqual(response.status_code, 200)

        # post to registration endpoint with correct data
        email = fake.email()
        pwd = fake.password()
        mobile_number = fake.numerify("##########")
        agency_name = fake.company()
        contact_name = fake.name()
        tos_accept = True

        response = self.client.post(self.__signup_url, {
            "username": email,
            "password1": pwd,
            "password2": pwd,
            "mobile_number": mobile_number,
            "agency_name": agency_name,
            "contact_name": contact_name,
            "tos_accept": tos_accept,
        })

        # check for a successful redirect into the portal
        self.assertRedirects(response, reverse("registration:agency_signup_success"), status_code=302, fetch_redirect_response=False)

        # check if email is sent
        self.assertEqual(len(mail.outbox), 1)
        reg_mail = mail.outbox[0]
        self.assertEqual(reg_mail.to[0], email)

        user = User.objects.get(email=email)

        # check if user has been added to agency group
        self.assertEqual(user.groups.first(), self.agency_group)

        # check if mobile number has been set correctly
        self.assertEqual(len(user.mobile_numbers.all()), 1)
        self.assertEqual(user.mobile_numbers.first().mobile_number, mobile_number)
        self.assertFalse(user.mobile_numbers.first().is_verified)

        # check if verification entry has been correctly created
        self.assertEqual(user.verification.is_verified, False)

        # click the verify link
        response = self.client.get(reverse('registration:agency_verify_email', kwargs={
            "key": user.verification.activation_key
        }))

        # check for a redirect to the app
        self.assertRedirects(response, reverse("registration:agency_login"), status_code=302, target_status_code=302)

        # check if the user was auto logged in
        self.assertTrue(auth.get_user(self.client).is_authenticated())

        # finally log the user out
        response = self.client.post(reverse("registration:agency_logout"))
        self.assertRedirects(response, reverse("registration:agency_login"), status_code=302, target_status_code=200)

    def test_non_matching_passwords(self):
        # post to registration endpoint
        email = fake.email()
        pwd1 = fake.password()
        pwd2 = fake.password()
        mobile_number = fake.numerify("##########")
        response = self.client.post(self.__signup_url, {
            "username": email,
            "mobile_number": mobile_number,
            "password1": pwd1,
            "password2": pwd2,
            "contact_name": fake.name(),
            "agency_name": fake.company(),
            "tos_accept": True,
        })

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["password2"].errors), 1)

    def test_empty_contact_name(self):
        # post to registration endpoint
        pwd = fake.password()
        response = self.client.post(self.__signup_url, {
            "username": fake.email(),
            "mobile_number": fake.numerify("##########"),
            "password1": pwd,
            "password2": pwd,
            "contact_name": "",
            "agency_name": fake.company(),
            "tos_accept": True,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["contact_name"].errors), 1)

    def test_invalid_mobile_number(self):
        # post to registration endpoint
        pwd = fake.password()
        response = self.client.post(self.__signup_url, {
            "username": fake.email(),
            "mobile_number": fake.numerify("#########"),
            "password1": pwd,
            "password2": pwd,
            "contact_name": fake.name(),
            "agency_name": fake.company(),
            "tos_accept": True,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["mobile_number"].errors), 1)

    def test_invalid_email(self):
        # post to registration endpoint
        email = fake.lexify("?????")
        pwd = fake.password()
        response = self.client.post(self.__signup_url, {
            "username": email,
            "mobile_number": fake.numerify("##########"),
            "password1": pwd,
            "password2": pwd,
            "contact_name": fake.name(),
            "agency_name": fake.company(),
            "tos_accept": True,
        })

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["username"].errors), 1)

    def test_pre_existing_email(self):
        # setup an existing auditor
        self.setup_agency_user()

        # post to registration endpoint
        pwd = fake.password()
        response = self.client.post(self.__signup_url, {
            "username": self.email,
            "mobile_number": fake.numerify("##########"),
            "password1": pwd,
            "password2": pwd,
            "contact_name": fake.name(),
            "agency_name": fake.company(),
            "tos_accept": True,
        })

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["username"].errors), 1)

    def test_pre_existing_mobile_number(self):
        # setup an existing auditor
        self.setup_agency_user()

        # post to registration endpoint
        pwd = fake.password()
        response = self.client.post(self.__signup_url, {
            "username": fake.email(),
            "mobile_number": self.mobile_number,
            "password1": pwd,
            "password2": pwd,
            "referred_by": "",
            "tos_accept": True,
        })

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["mobile_number"].errors), 1)

