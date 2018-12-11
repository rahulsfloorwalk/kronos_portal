from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase

from model_mommy import mommy
from expects import expect, equal, have_length, have_key

from faker import Faker

from audit.models import AuditCycle
from questionnaire.models import Section
from registration.models import GROUP_NAME_MANAGER

fake = Faker()


class SectionIdViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

        self.client.login(username=self.email, password=self.password)

    def test_get_retrieves_section(self):
        section = mommy.make(Section)

        response = self.client.get(reverse('manager:section_id_view', kwargs = {
            'section_id': section.id,
        }))

        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_key("id", section.id))
        expect(response.data).to(have_key("name", section.name))
        expect(response.data).to(have_key("audit_cycle", section.audit_cycle_id))
        expect(response.data).to(have_key("sequence", section.sequence))
        expect(response.data).to(have_key("minimum_attachment_count", section.minimum_attachment_count))

    def test_post_updates_a_section(self):
        section = mommy.make(Section)

        post_data = {
            "name": fake.name(),
            "sequence": fake.pyint(),
            "audit_cycle": section.audit_cycle_id,
            "minimum_attachment_count": 2,
        }

        response = self.client.post(reverse('manager:section_id_view', kwargs = {
            'section_id': section.id,
        }), post_data)

        expect(response.status_code).to(equal(200))

        for k, v in post_data.items():
            with self.subTest(k=k, v=v):
                expect(response.data).to(have_key(k, v))

    def test_delete_deletes_a_section(self):
        section = mommy.make(Section)

        response = self.client.delete(reverse('manager:section_id_view', kwargs = {
            'section_id': section.id,
        }))

        expect(response.status_code).to(equal(204))


class SectionViewTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

        self.client.login(username=self.email, password=self.password)

    def test_post_creates_a_section(self):
        audit_cycle = mommy.make(AuditCycle)

        post_data = {
            "name": fake.name(),
            "sequence": fake.pyint(),
            "audit_cycle": audit_cycle.id,
            "minimum_attachment_count": 2,
        }

        response = self.client.post(reverse('manager:section_view'), post_data)

        expect(response.status_code).to(equal(200))

        for k, v in post_data.items():
            with self.subTest(k=k, v=v):
                expect(response.data).to(have_key(k, v))


class SectionViewByAuditCycleTestCase(APITestCase):
    fixtures = ['groups']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()

        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username=self.email, email=self.email, password=make_password(self.password),
                                       groups=[self.manager_group])

        self.client.login(username=self.email, password=self.password)

    def test_get_retrieves_all_sections_for_given_audit_cycle(self):
        audit_cycle = mommy.make(AuditCycle)
        sections = mommy.make(Section, audit_cycle=audit_cycle, _quantity=3)

        response = self.client.get(reverse('manager:section_by_audit_cycle', kwargs = {
            "audit_cycle_id": audit_cycle.id,
        }))

        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_length(len(sections)))

        for section in response.data:
            with self.subTest(section=section):
                expect(section).to(have_key("audit_cycle", audit_cycle.id))

