from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AGENCY
from registration.models import MobileNumber

from agency.models import Agency, AgencyUser

fake = Faker()

class UserViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency_user = AgencyUser.objects.create(agency=self.agency, user=self.user, full_name=fake.name())
        self.user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.user.save()
        self.mobile_numbers = mommy.make(MobileNumber, user=self.user, _quantity=1)

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_get_fetches_logged_in_user(self):
        self.setup_agency()
        self.setup_agency_user()
        self.login()

        response = self.client.get(reverse('agency_rest:user_view'))
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data.items(), {
            "id": self.user.id,
            "email": self.user.email,
        }.items())

        self.assertGreater(response.data['agencyuser'].items(), {
            "full_name": self.agency_user.full_name,
        }.items())

        self.assertEqual(len(response.data['mobile_numbers']), len(self.mobile_numbers))
