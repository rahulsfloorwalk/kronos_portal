from django.test import TestCase, override_settings
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType

from model_mommy import mommy

from kronos.exceptions import AppLogicError, ObjectNotFound
from attachment.models import Attachment
from questionnaire.models import Section
from answer.models import ReportSection
from attachment import service as attachment_service
from attachment import service_agency as attachment_agency_service
from audit_store.models import AuditStore
from audit.models import AuditCycle
from registration.models import GROUP_NAME_AGENCY


class AttachmentAgencyServiceTestCase(TestCase):
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
        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                      groups=[self.agency_group])
        self.another_agency_user = mommy.make(User, username="another@foobar.com", email="another@foobar.com",
                                              groups=[self.agency_group])

    @override_settings(AWS = test_aws_settings)
    def test_upload_for_audit_store_for_agency_creates_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user, audit__audit_cycle=audit_cycle)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        post_data, created_attachment = attachment_agency_service.upload_for_audit_store_by_agency(
            audit_store.id,
            test_file,
            test_size,
            test_mime_type,
            self.agency_user.id,
        )
        self.assertEqual(test_file, created_attachment.file_name)
        self.assertEqual(test_size, created_attachment.file_size)
        self.assertEqual(test_mime_type, created_attachment.mime_type)
        self.assertEqual(Attachment.PHOTO, created_attachment.proof_type)
        self.assertEqual(Attachment.UPLOADING, created_attachment.status)

    @override_settings(AWS=test_aws_settings)
    def test_upload_for_report_section_for_agency_creates_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        post_data, created_attachment = attachment_agency_service.upload_for_report_section_by_agency(
            audit_store.id,
            section.id,
            test_file,
            test_size,
            test_mime_type,
            self.agency_user.id,
        )
        self.assertEqual(test_file, created_attachment.file_name)
        self.assertEqual(test_size, created_attachment.file_size)
        self.assertEqual(test_mime_type, created_attachment.mime_type)
        self.assertEqual(Attachment.PHOTO, created_attachment.proof_type)
        self.assertEqual(Attachment.UPLOADING, created_attachment.status)

    @override_settings(AWS=test_aws_settings)
    def test_find_by_audit_store_for_agency_returns_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(AuditStore),
            object_id=audit_store.id,
        )
        attachments = attachment_agency_service.find_by_audit_store_for_agency(
            audit_store.id,
            self.agency_user.id,
        )
        self.assertEqual(1, len(attachments))
        self.assertEqual(test_file, attachments[0].file_name)
        self.assertEqual(test_size, attachments[0].file_size)
        self.assertEqual(test_mime_type, attachments[0].mime_type)
        self.assertEqual(Attachment.ATTACHED, attachments[0].status)

    @override_settings(AWS=test_aws_settings)
    def test_find_by_audit_store_and_section_for_agency_returns_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        attachments = attachment_agency_service.find_by_audit_store_and_section_for_agency(
            audit_store.id,
            section.id,
            self.agency_user.id,
        )
        self.assertEqual(1, len(attachments))
        self.assertEqual(test_file, attachments[0].file_name)
        self.assertEqual(test_size, attachments[0].file_size)
        self.assertEqual(test_mime_type, attachments[0].mime_type)
        self.assertEqual(Attachment.ATTACHED, attachments[0].status)

    @override_settings(AWS=test_aws_settings)
    def test_complete_for_agency_changes_status_as_attached(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        completed_attachment = attachment_agency_service.complete_for_agency(
            attachment.id,
            self.agency_user.id,
        )
        self.assertEqual(test_file, completed_attachment.file_name)
        self.assertEqual(test_size, completed_attachment.file_size)
        self.assertEqual(test_mime_type, completed_attachment.mime_type)
        self.assertEqual(Attachment.ATTACHED, completed_attachment.status)

    @override_settings(AWS=test_aws_settings)
    def test_complete_for_agency_raises_exception_when_user_is_different(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        with self.assertRaises(ObjectNotFound):
            attachment_agency_service.complete_for_agency(
                attachment.id,
                self.another_agency_user.id,
            )

    @override_settings(AWS=test_aws_settings)
    def test_complete_for_agency_raises_exception_when_contenttype_is_different(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(Section),
            object_id=report_section.id,
        )
        with self.assertRaisesRegex(AppLogicError, "Invalid Attachment Content Type detected"):
            attachment_agency_service.complete_for_agency(
                attachment.id,
                self.another_agency_user.id,
            )

    @override_settings(AWS=test_aws_settings)
    def test_complete_for_agency_raises_exception_when_audit_store_not_acknowledged(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        with self.assertRaisesRegex(AppLogicError, "Cannot complete attachment now"):
            attachment_agency_service.complete_for_agency(
                attachment.id,
                self.agency_user.id,
            )

    @override_settings(AWS=test_aws_settings)
    def test_delete_for_agency_changes_status_as_deleted(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        attachment = mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        attachment_agency_service.delete_for_agency(
            attachment.id,
            self.agency_user.id,
        )
        deleted_attachment = attachment_service.find_by_id(attachment.id)
        self.assertEqual(Attachment.DELETED, deleted_attachment.status)

    @override_settings(AWS=test_aws_settings)
    def test_delete_for_agency_raises_exception(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=test_file,
            file_size=test_size,
            mime_type=test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        with self.assertRaisesRegex(AppLogicError, "Cannot delete attachment now"):
            attachment_agency_service.delete_for_agency(
                attachment.id,
                self.agency_user.id,
            )
