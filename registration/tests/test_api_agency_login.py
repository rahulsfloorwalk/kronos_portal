from django.test import TestCase
from django.urls import reverse
from django.contrib import auth
from django.contrib.auth.models import User, Group
from django.conf import settings

from model_mommy import mommy

from faker import Faker

from agency.models import Agency, AgencyUser
from registration.models import GROUP_NAME_AGENCY
from registration.models import MobileNumber
from registration.models import Verification

fake = Faker()

class AgencyLoginAPITestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency_user(self):
        self.email = fake.email()
        self.password = fake.password()

        self.agency = Agency.objects.create(name=fake.company())
        self.user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.mobile_number = mommy.make(MobileNumber, mobile_number=fake.numerify("##########"), user=self.user, is_verified=True)
        self.agency_user = AgencyUser.objects.create(agency=self.agency, user=self.user, full_name=fake.name())
        self.verification = mommy.make(Verification, user=self.user, is_verified=True)

    def test_normal_email_login_flow(self):
        """tests agency login with correct email and password"""

        self.setup_agency_user()

        # post to login endpoint with correct data
        response = self.client.post(reverse('registration:agency_login'), {
            "username": self.email,
            "password": self.password,
        })

        # check for a redirect to portal
        self.assertRedirects(response, settings.FRONTEND_CONFIG["AGENCY"]["LOGIN_SUCCESS_REDIRECT_URL"], status_code=302, target_status_code=200, fetch_redirect_response=False)

        # check if the user was logged in correctly
        self.assertTrue(auth.get_user(self.client).is_authenticated())

        # finally log the user out
        response = self.client.post(reverse("registration:agency_logout"))
        self.assertRedirects(response, reverse("registration:agency_login"), status_code=302, target_status_code=200)
