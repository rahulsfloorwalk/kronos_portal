import datetime

from django.test import TestCase
from django.urls import reverse
from django.contrib import auth
from django.contrib.auth.models import User, Group
from django.conf import settings
from django.utils import timezone

from faker import Faker

from registration.models import Verification, GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

fake = Faker()

class LoginAPITestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.u = User.objects.create_user(username=self.email, email=self.email, password=self.password)
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

    def test_normal_email_login_flow(self):
        """tests logging in with correct email and password"""
        self.setup_verification()
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:login'), {
            "username": self.email,
            "password": self.password,
        })

        # check for a redirect to portal
        self.assertRedirects(response, settings.FRONTEND_CONFIG["AUDITOR"]["LOGIN_SUCCESS_REDIRECT_URL"], status_code=302, target_status_code=200, fetch_redirect_response=False)

        # check if the user was logged in correctly
        self.assertTrue(auth.get_user(self.client).is_authenticated())

    def test_normal_phone_login_flow(self):
        """tests logging in with correct phone and password"""
        self.setup_verification()
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:login'), {
            "username": self.mobile,
            "password": self.password,
        })

        # check for a redirect to portal
        self.assertRedirects(response, settings.FRONTEND_CONFIG["AUDITOR"]["LOGIN_SUCCESS_REDIRECT_URL"], status_code=302, target_status_code=200, fetch_redirect_response=False)

        # check if the user was logged in correctly
        self.assertTrue(auth.get_user(self.client).is_authenticated())

    def test_correct_email_incorrect_password_login_flow(self):
        """tests logging in with correct email and incorrect password"""
        self.setup_verification()
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:login'), {
            "username": self.email,
            "password": fake.lexify("??????????"),
        })

        # check for a 200 on the same page
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"].non_field_errors()), 1)
        self.assertEqual(response.context["form"].non_field_errors()[0], "Please enter a correct username and password. Note that both fields may be case-sensitive.")

        # check if the user was not logged in correctly
        self.assertFalse(auth.get_user(self.client).is_authenticated())

    def test_correct_phone_incorrect_password_login_flow(self):
        """tests logging in with correct phone and incorrect password"""
        self.setup_verification()
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:login'), {
            "username": self.mobile,
            "password": fake.lexify("??????????"),
        })

        # check for a 200 on the same page
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"].non_field_errors()), 1)
        self.assertEqual(response.context["form"].non_field_errors()[0], "Please enter a correct username and password. Note that both fields may be case-sensitive.")

        # check if the user was not logged in correctly
        self.assertFalse(auth.get_user(self.client).is_authenticated())

    def test_incorrect_email_incorrect_password_login_flow(self):
        """tests logging in with incorrect email and incorrect password"""
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:login'), {
            "username": fake.email(),
            "password": fake.lexify("??????????"),
        })

        # check for a 200 on the same page
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"].non_field_errors()), 1)
        self.assertEqual(response.context["form"].non_field_errors()[0], "Please enter a correct username and password. Note that both fields may be case-sensitive.")

        # check if the user was not logged in correctly
        self.assertFalse(auth.get_user(self.client).is_authenticated())

    def test_incorrect_phone_incorrect_password_login_flow(self):
        """tests logging in with correct inphone and incorrect password"""
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:login'), {
            "username": fake.numerify("##########"),
            "password": fake.lexify("??????????"),
        })

        # check for a 200 on the same page
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"].non_field_errors()), 1)
        self.assertEqual(response.context["form"].non_field_errors()[0], "Please enter a correct username and password. Note that both fields may be case-sensitive.")

        # check if the user was not logged in correctly
        self.assertFalse(auth.get_user(self.client).is_authenticated())

    def test_unverified_correct_email_correct_password_login_flow(self):
        """tests logging in with unverified but correct email and correct password"""
        self.setup_verification(False)
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:login'), {
            "username": self.email,
            "password": self.password,
        })

        # check for a 200 on the same page
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"].non_field_errors()), 1)
        self.assertEqual(response.context["form"].non_field_errors()[0], "Your account is not verified. Please check your email for the verification link.")

        # check if the user was not logged in correctly
        self.assertFalse(auth.get_user(self.client).is_authenticated())

    def test_unverified_correct_phone_correct_password_login_flow(self):
        """tests logging in with unverified but correct phone and correct password"""
        self.setup_verification(False)
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:login'), {
            "username": self.mobile,
            "password": self.password,
        })

        # check for a 200 on the same page
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"].non_field_errors()), 1)
        self.assertEqual(response.context["form"].non_field_errors()[0], "Your account is not verified. Please check your email for the verification link.")

        # check if the user was not logged in correctly
        self.assertFalse(auth.get_user(self.client).is_authenticated())
