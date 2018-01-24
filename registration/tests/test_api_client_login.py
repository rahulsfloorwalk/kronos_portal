
from django.test import TestCase
from django.urls import reverse
from django.contrib import auth
from django.contrib.auth.models import User, Group
from django.conf import settings

from faker import Faker

from registration.models import GROUP_NAME_CLIENT

fake = Faker()

class ClientLoginAPITestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.u = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.u.groups.add(Group.objects.get(name=GROUP_NAME_CLIENT))
        self.u.save()

    def test_normal_email_login_flow(self):
        """tests client login with correct email and password"""
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:client_login'), {
            "username": self.email,
            "password": self.password,
        })

        # check for a redirect to portal
        self.assertRedirects(response, settings.FRONTEND_CONFIG["CLIENT"]["LOGIN_SUCCESS_REDIRECT_URL"], status_code=302, target_status_code=200, fetch_redirect_response=False)

        # check if the user was logged in correctly
        self.assertTrue(auth.get_user(self.client).is_authenticated())

        # finally log the user out
        response = self.client.post(reverse("registration:client_logout"))
        self.assertRedirects(response, reverse("registration:client_login"), status_code=302, target_status_code=200)

    def test_correct_email_incorrect_password_login_flow(self):
        """tests client login with correct email and incorrect password"""
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:client_login'), {
            "username": self.email,
            "password": fake.lexify("??????????"),
        })

        # check for a 200 on the same page
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"].non_field_errors()), 1)
        self.assertEqual(response.context["form"].non_field_errors()[0], "Please enter a correct username and password. Note that both fields may be case-sensitive.")

        # check if the user was not logged in correctly
        self.assertFalse(auth.get_user(self.client).is_authenticated())

    def test_incorrect_email_incorrect_password_login_flow(self):
        """tests client login with incorrect email and incorrect password"""
        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:client_login'), {
            "username": fake.email(),
            "password": fake.lexify("??????????"),
        })

        # check for a 200 on the same page
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"].non_field_errors()), 1)
        self.assertEqual(response.context["form"].non_field_errors()[0], "Please enter a correct username and password. Note that both fields may be case-sensitive.")

        # check if the user was not logged in correctly
        self.assertFalse(auth.get_user(self.client).is_authenticated())

