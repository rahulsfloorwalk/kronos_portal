from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib import auth
from django.contrib.auth.models import User, Group
from django.core import mail

from model_mommy import mommy
from faker import Faker

from client.models import Client, ClientUser, BankInfo
from registration.models import GROUP_NAME_CLIENT
from registration.models import MobileNumber

fake = Faker()

test_email_switches = {
    "CLIENT_VERIFICATION_EMAIL": True,
}

class ClientSignupAPITestCase(TestCase):
    fixtures = ['groups', 'city']
    __signup_url = reverse('registration:client_signup')

    def setUp(self):
        self.client_group = Group.objects.get(name=GROUP_NAME_CLIENT)

    def setup_client_user(self):
        self.email = fake.email()
        self.mobile_number = fake.numerify("##########")
        self.password = fake.password()
        self.client_name = fake.name()
        self.full_name = fake.name()
        self.is_auto_signup = True

        self.client_obj = Client.objects.create_client(self.email, self.client_name, self.mobile_number, self.is_auto_signup)
        self.client_user = ClientUser.objects.create_client_user(self.email, self.password, self.client_obj, self.full_name, is_client_admin = True)
        self.user = self.client_user.user

        self.bank_info = BankInfo(client=self.client_obj)
        self.bank_info.save()

        mommy.make(MobileNumber, mobile_number=self.mobile_number, user=self.user)

    @override_settings(EMAIL_SWITCH = test_email_switches)
    def test_normal_signup_flow(self):
        # check if the form loads correctly
        response = self.client.get(self.__signup_url)
        self.assertEqual(response.status_code, 200)

        # post to registration endpoint with correct data
        company_email = "company_email@floorwalk.in"
        pwd = fake.password()
        mobile_number = fake.numerify("##########")
        client_name = fake.company()
        full_name = fake.name()
        tos_accept = True

        response = self.client.post(self.__signup_url, {
            "username": company_email,
            "password1": pwd,
            "password2": pwd,
            "mobile_number": mobile_number,
            "client_name": client_name,
            "full_name": full_name,
            "tos_accept": tos_accept,
        })

        # check client is auto created or not
        client_obj1 = Client.objects.get(email = company_email)
        self.assertTrue(client_obj1.is_auto_signup)

        # check for a successful redirect into the portal
        self.assertRedirects(response, reverse("registration:client_signup_success"), status_code=302, fetch_redirect_response=False)

        # check if email is sent
        self.assertEqual(len(mail.outbox), 1)
        reg_mail = mail.outbox[0]
        self.assertEqual(reg_mail.to[0], company_email)

        user = User.objects.get(email=company_email)

        # check if user has been added to client group
        self.assertEqual(user.groups.first(), self.client_group)

        # check if mobile number has been set correctly
        self.assertEqual(len(user.mobile_numbers.all()), 1)
        self.assertEqual(user.mobile_numbers.first().mobile_number, mobile_number)
        self.assertFalse(user.mobile_numbers.first().is_verified)

        # check if verification entry has been correctly created
        self.assertEqual(user.verification.is_verified, False)

        # click the verify link
        response = self.client.get(reverse('registration:client_verify_email', kwargs={
            "key": user.verification.activation_key
        }))

        # check for a redirect to the app
        self.assertRedirects(response, reverse("registration:client_login"), status_code=302, target_status_code=302)

        # check if the user was auto logged in
        self.assertTrue(auth.get_user(self.client).is_authenticated())

        # finally log the user out
        response = self.client.post(reverse("registration:client_logout"))
        self.assertRedirects(response, reverse("registration:client_login"), status_code=302, target_status_code=200)

    def test_non_matching_passwords(self):
        # post to registration endpoint
        company_email = fake.email()
        pwd1 = fake.password()
        pwd2 = fake.password()
        mobile_number = fake.numerify("##########")
        response = self.client.post(self.__signup_url, {
            "username": company_email,
            "mobile_number": mobile_number,
            "password1": pwd1,
            "password2": pwd2,
            "full_name": fake.name(),
            "client_name": fake.company(),
            "tos_accept": True,
        })

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["password2"].errors), 1)

    def test_non_business_email(self):
        # post to registration endpoint
        company_email = "company_email@gmail.com"
        pwd1 = fake.password()
        pwd2 = fake.password()
        mobile_number = fake.numerify("##########")
        response = self.client.post(self.__signup_url, {
            "username": company_email,
            "mobile_number": mobile_number,
            "password1": pwd1,
            "password2": pwd2,
            "full_name": fake.name(),
            "client_name": fake.company(),
            "tos_accept": True,
        })

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["username"].errors), 1)

    def test_empty_client_name(self):
        # post to registration endpoint
        pwd = fake.password()
        response = self.client.post(self.__signup_url, {
            "username": fake.email(),
            "mobile_number": fake.numerify("##########"),
            "password1": pwd,
            "password2": pwd,
            "client_name": "",
            "full_name": fake.name(),
            "tos_accept": True,
        }, follow=True)

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["client_name"].errors), 1)

    def test_invalid_mobile_number(self):
        # post to registration endpoint
        pwd = fake.password()
        response = self.client.post(self.__signup_url, {
            "username": fake.email(),
            "mobile_number": fake.numerify("#########"),
            "password1": pwd,
            "password2": pwd,
            "full_name": fake.name(),
            "client_name": fake.company(),
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
            "full_name": fake.name(),
            "client_name": fake.company(),
            "tos_accept": True,
        })

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["username"].errors), 1)

    def test_pre_existing_email(self):
        # setup an existing client
        self.setup_client_user()

        # post to registration endpoint
        pwd = fake.password()
        response = self.client.post(self.__signup_url, {
            "username": self.email,
            "mobile_number": fake.numerify("##########"),
            "password1": pwd,
            "password2": pwd,
            "full_name": fake.name(),
            "client_name": fake.company(),
            "tos_accept": True,
        })

        # check for a 200 on the same page, with errors
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["form"]["username"].errors), 1)

    def test_pre_existing_mobile_number(self):
        # setup an existing client
        self.setup_client_user()

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


    def test_client_auto_signup(self):
        # setup an existing client
        self.setup_client_user()

        self.assertEqual(self.client_obj.is_auto_signup, self.is_auto_signup)
