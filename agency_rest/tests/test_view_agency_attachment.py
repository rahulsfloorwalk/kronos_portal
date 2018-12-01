from django.urls import reverse

from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APITestCase
from django.test import override_settings

from model_mommy import mommy

from faker import Faker

from registration.models import GROUP_NAME_AGENCY

from agency.models import Agency, AgencyUser
from attachment.models import Attachment
from audit.models import AuditCycle
from audit_store.models import AuditStore
from answer.models import ReportSection
from questionnaire.models import Section

fake = Faker()


class AuditStoreAttachmentViewTestCase(APITestCase):
    fixtures = ['groups']

    test_aws_settings = {
        "S3_ATTACHMENTS": {
            "AWS_ACCESS_KEY_ID": "foo",
            "AWS_SECRET_ACCESS_KEY": "bar",
            "BUCKET": "floorwalk-attachments",
            "REGION": "ap-southeast-1",
            "MIN_SIZE": 10,
            "MAX_SIZE": 1024 * 1024,
            "FILE_SLUG_SIZE": 100,
        }
    }

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency = AgencyUser.objects.create(agency=self.agency, user=self.agency_user, full_name=fake.name())
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

    def setup_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        self.audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=audit_cycle)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        self.attachment = mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(AuditStore),
            object_id=self.audit_store.id,
        )

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    @override_settings(AWS=test_aws_settings)
    def test_audit_store_attachment_view_get(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_attachment()
        self.login()

        url = reverse("agency_rest:audit_store_attachment_view", kwargs={
            "audit_store_id": self.audit_store.id
        })

        response = self.client.get(url, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(response.data))

    @override_settings(AWS=test_aws_settings)
    def test_audit_store_attachment_view_post(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_attachment()
        self.login()

        url = reverse("agency_rest:audit_store_attachment_view", kwargs={
            "audit_store_id": self.audit_store.id
        })

        payload = {
            'file_name': 'hello_world.jpg',
            'file_type': 'image/jpeg',
            'file_size': 2048
        }

        response = self.client.post(url, payload, format="json")
        content_type = ContentType.objects.get(pk=int(response.data['attachment']['content_type']))
        self.assertEqual(200, response.status_code)
        self.assertEqual('PHOTO', response.data['attachment']['proof_type'])
        self.assertEqual('image/jpeg', response.data['attachment']['mime_type'])
        self.assertEqual('hello_world.jpg', response.data['attachment']['file_name'])
        self.assertEqual('audit_store', content_type.app_label)
        self.assertEqual('auditstore', content_type.model)
        self.assertEqual('UPLOADING', response.data['attachment']['status'])


class ReportSectionAttachmentViewTestCase(APITestCase):
    fixtures = ['groups']

    test_aws_settings = {
        "S3_ATTACHMENTS": {
            "AWS_ACCESS_KEY_ID": "foo",
            "AWS_SECRET_ACCESS_KEY": "bar",
            "BUCKET": "floorwalk-attachments",
            "REGION": "ap-southeast-1",
            "MIN_SIZE": 10,
            "MAX_SIZE": 1024 * 1024,
            "FILE_SLUG_SIZE": 100,
        }
    }

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency = AgencyUser.objects.create(agency=self.agency, user=self.agency_user, full_name=fake.name())
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

    def setup_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        self.audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                      audit__audit_cycle=audit_cycle)
        self.section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, audit_store=self.audit_store, section=self.section)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        self.attachment = mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    @override_settings(AWS=test_aws_settings)
    def test_report_section_attachment_view_get(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_attachment()
        self.login()

        url = reverse("agency_rest:report_section_attachment_view", kwargs={
            "audit_store_id": self.audit_store.id,
            "section_id": self.section.id
        })

        response = self.client.get(url, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(response.data))

    @override_settings(AWS=test_aws_settings)
    def test_report_section_attachment_view_post(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_attachment()
        self.login()

        url = reverse("agency_rest:report_section_attachment_view", kwargs={
            "audit_store_id": self.audit_store.id,
            "section_id": self.section.id
        })

        payload = {
            'file_name': 'hello_world.jpg',
            'file_type': 'image/jpeg',
            'file_size': 2048
        }

        response = self.client.post(url, payload, format="json")
        content_type = ContentType.objects.get(pk=int(response.data['attachment']['content_type']))
        self.assertEqual(200, response.status_code)
        self.assertEqual('PHOTO', response.data['attachment']['proof_type'])
        self.assertEqual('image/jpeg', response.data['attachment']['mime_type'])
        self.assertEqual('hello_world.jpg', response.data['attachment']['file_name'])
        self.assertEqual('answer', content_type.app_label)
        self.assertEqual('reportsection', content_type.model)
        self.assertEqual('UPLOADING', response.data['attachment']['status'])


class AttachmentIdViewTestCase(APITestCase):
    fixtures = ['groups']

    test_aws_settings = {
        "S3_ATTACHMENTS": {
            "AWS_ACCESS_KEY_ID": "foo",
            "AWS_SECRET_ACCESS_KEY": "bar",
            "BUCKET": "floorwalk-attachments",
            "REGION": "ap-southeast-1",
            "MIN_SIZE": 10,
            "MAX_SIZE": 1024 * 1024,
            "FILE_SLUG_SIZE": 100,
        }
    }

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency = AgencyUser.objects.create(agency=self.agency, user=self.agency_user, full_name=fake.name())
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

    def setup_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        self.attachment = mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(AuditStore),
            object_id=audit_store.id,
        )

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    @override_settings(AWS=test_aws_settings)
    def test_delete_deletes_attachment(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_attachment()
        self.login()

        url = reverse("agency_rest:attachment_id_view", kwargs={
            "attachment_id": self.attachment.id
        })

        response = self.client.delete(url, format="json")
        self.assertEqual(200, response.status_code)


class AttachmentCompleteViewTestCase(APITestCase):
    fixtures = ['groups']

    test_aws_settings = {
        "S3_ATTACHMENTS": {
            "AWS_ACCESS_KEY_ID": "foo",
            "AWS_SECRET_ACCESS_KEY": "bar",
            "BUCKET": "floorwalk-attachments",
            "REGION": "ap-southeast-1",
            "MIN_SIZE": 10,
            "MAX_SIZE": 1024 * 1024,
            "FILE_SLUG_SIZE": 100,
        }
    }

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)

    def setup_agency(self):
        self.agency = mommy.make(Agency)

    def setup_agency_user(self):
        self.email = fake.email()
        self.mobile = fake.numerify("##########")
        self.password = fake.password()

        self.agency_user = User.objects.create_user(username=self.email, email=self.email, password=self.password)
        self.agency = AgencyUser.objects.create(agency=self.agency, user=self.agency_user, full_name=fake.name())
        self.agency_user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        self.agency_user.save()

    def setup_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        self.attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            proof_type=Attachment.PHOTO,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(AuditStore),
            object_id=audit_store.id,
        )

    def login(self):
        # login first
        self.client.login(username=self.email, password=self.password)

    @override_settings(AWS=test_aws_settings)
    def test_complete_changes_attachment_status(self):
        self.setup_agency()
        self.setup_agency_user()
        self.setup_attachment()
        self.login()

        url = reverse("agency_rest:attachment_complete_view", kwargs={
            "attachment_id": self.attachment.id
        })

        payload = {}
        response = self.client.post(url, payload, format="json")
        content_type = ContentType.objects.get(pk=int(response.data['content_type']))
        self.assertEqual(200, response.status_code)
        self.assertEqual('PHOTO', response.data['proof_type'])
        self.assertEqual('image/jpeg', response.data['mime_type'])
        self.assertEqual('hello_world.jpg', response.data['file_name'])
        self.assertEqual('audit_store', content_type.app_label)
        self.assertEqual('auditstore', content_type.model)
        self.assertEqual('ATTACHED', response.data['status'])
