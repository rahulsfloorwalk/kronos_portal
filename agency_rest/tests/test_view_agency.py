from django.urls import reverse

from django.contrib.auth.models import User, Group

from rest_framework.test import APITestCase

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AGENCY

from agency.models import Agency, AgencyUser

fake = Faker()

class AgencyViewTestCase(APITestCase):
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

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    def test_get_fetches_agency_object(self):
        self.setup_agency()
        self.setup_agency_user()
        self.login()

        # check if the endpoint returns success initially
        response = self.client.get(reverse('agency_rest:agency_view'))
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data, {
            "id": self.agency.id,
            "name": self.agency.name,
            "formed_in_year": self.agency.formed_in_year,
            "gstin": self.agency.gstin,
            "cin": self.agency.cin,
            "strength": self.agency.strength,
        })

    def test_post_saves_agency_object(self):
        self.setup_agency()
        self.setup_agency_user()
        self.login()

        input_data = {
            'name': fake.company(),
            'formed_in_year': int(fake.year()),
            'gstin': fake.lexify("???????????????"),
            'cin': fake.lexify("?????????????????????"),
            'strength': fake.pyint(),
        }

        response = self.client.post(reverse('agency_rest:agency_view'), input_data, format="json")
        self.assertEqual(response.status_code, 200)
        for k,v in input_data.items():
            self.assertEqual(v, response.data.get(k))

