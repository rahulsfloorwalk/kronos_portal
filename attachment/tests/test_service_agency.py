from django.test import TestCase, override_settings
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType

from expects import expect, equal, be_a, be_an
from model_mommy import mommy

from kronos.exceptions import AppLogicError, ObjectNotFound
from attachment.models import Attachment
from questionnaire.models import Section, Question
from answer.models import ReportSection, Answer
from attachment import service_agency as attachment_agency_service
from audit_store.models import AuditStore
from audit.models import AuditCycle
from registration.models import GROUP_NAME_AGENCY

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

@override_settings(AWS = test_aws_settings)
class AttachmentAgencyServiceTestCase(TestCase):
    fixtures = ['groups']

    test_file = "hello_world.jpg"
    test_mime_type = "image/jpeg"
    test_size = 2048

    def setUp(self):
        self.agency_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.agency_user = mommy.make(User, username="agency@foobar.com", email="agency@foobar.com",
                                      groups=[self.agency_group])
        self.another_agency_user = mommy.make(User, username="another@foobar.com", email="another@foobar.com",
                                              groups=[self.agency_group])

    def test_upload_for_audit_store_for_agency_creates_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user, audit__audit_cycle=audit_cycle)
        post_data, created_attachment = attachment_agency_service.upload_for_audit_store_by_agency(
            audit_store.id,
            self.test_file,
            self.test_size,
            self.test_mime_type,
            self.agency_user.id,
        )
        expect(created_attachment.file_name).to(equal(self.test_file))
        expect(created_attachment.file_size).to(equal(self.test_size))
        expect(created_attachment.mime_type).to(equal(self.test_mime_type))
        expect(created_attachment.proof_type).to(equal(Attachment.PHOTO))
        expect(created_attachment.status).to(equal(Attachment.UPLOADING))
        expect(created_attachment.content_object).to(be_an(AuditStore))

    def test_upload_for_report_section_for_agency_creates_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        post_data, created_attachment = attachment_agency_service.upload_for_report_section_by_agency(
            audit_store.id,
            section.id,
            self.test_file,
            self.test_size,
            self.test_mime_type,
            self.agency_user.id,
        )
        expect(created_attachment.file_name).to(equal(self.test_file))
        expect(created_attachment.file_size).to(equal(self.test_size))
        expect(created_attachment.mime_type).to(equal(self.test_mime_type))
        expect(created_attachment.proof_type).to(equal(Attachment.PHOTO))
        expect(created_attachment.status).to(equal(Attachment.UPLOADING))
        expect(created_attachment.content_object).to(be_a(ReportSection))

    def test_upload_for_answer_for_agency_creates_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        question = mommy.make(Question, section__audit_cycle=audit_cycle)
        post_data, created_attachment = attachment_agency_service.upload_for_answer_by_agency(
            audit_store.id,
            question.id,
            self.test_file,
            self.test_size,
            self.test_mime_type,
            self.agency_user.id,
        )
        expect(created_attachment.file_name).to(equal(self.test_file))
        expect(created_attachment.file_size).to(equal(self.test_size))
        expect(created_attachment.mime_type).to(equal(self.test_mime_type))
        expect(created_attachment.proof_type).to(equal(Attachment.PHOTO))
        expect(created_attachment.status).to(equal(Attachment.UPLOADING))
        expect(created_attachment.content_object).to(be_an(Answer))

    def test_find_by_audit_store_for_agency_returns_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(AuditStore),
            object_id=audit_store.id,
        )
        attachments = attachment_agency_service.find_by_audit_store_for_agency(
            audit_store.id,
            self.agency_user.id,
        )
        self.assertEqual(1, len(attachments))
        self.assertEqual(self.test_file, attachments[0].file_name)
        self.assertEqual(self.test_size, attachments[0].file_size)
        self.assertEqual(self.test_mime_type, attachments[0].mime_type)
        self.assertEqual(Attachment.ATTACHED, attachments[0].status)

    def test_find_by_audit_store_and_section_for_agency_returns_attachment(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        attachments = attachment_agency_service.find_by_audit_store_and_section_for_agency(
            audit_store.id,
            section.id,
            self.agency_user.id,
        )
        self.assertEqual(1, len(attachments))
        self.assertEqual(self.test_file, attachments[0].file_name)
        self.assertEqual(self.test_size, attachments[0].file_size)
        self.assertEqual(self.test_mime_type, attachments[0].mime_type)
        self.assertEqual(Attachment.ATTACHED, attachments[0].status)

    def test_complete_for_agency_changes_status_as_attached(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        completed_attachment = attachment_agency_service.complete_for_agency(
            attachment.id,
            self.agency_user.id,
        )
        self.assertEqual(self.test_file, completed_attachment.file_name)
        self.assertEqual(self.test_size, completed_attachment.file_size)
        self.assertEqual(self.test_mime_type, completed_attachment.mime_type)
        self.assertEqual(Attachment.ATTACHED, completed_attachment.status)

    def test_complete_for_agency_raises_exception_when_user_is_different(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        with self.assertRaises(ObjectNotFound):
            attachment_agency_service.complete_for_agency(
                attachment.id,
                self.another_agency_user.id,
            )

    def test_complete_for_agency_raises_exception_when_contenttype_is_different(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(Section),
            object_id=report_section.id,
        )
        with self.assertRaisesRegex(AppLogicError, "Invalid Attachment Content Type"):
            attachment_agency_service.complete_for_agency(
                attachment.id,
                self.another_agency_user.id,
            )

    def test_complete_for_agency_raises_exception_when_audit_store_not_acknowledged(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        with self.assertRaisesRegex(AppLogicError, "Cannot complete attachment now"):
            attachment_agency_service.complete_for_agency(
                attachment.id,
                self.agency_user.id,
            )

    def test_delete_for_agency_changes_status_as_deleted(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        attachment_agency_service.delete_for_agency(
            attachment.id,
            self.agency_user.id,
        )
        attachment.refresh_from_db()
        self.assertEqual(Attachment.DELETED, attachment.status)

    def test_delete_for_agency_raises_exception_when_user_is_different(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        with self.assertRaises(ObjectNotFound):
            attachment_agency_service.delete_for_agency(
                attachment.id,
                self.another_agency_user.id,
            )

    def test_delete_for_agency_raises_exception_when_contenttype_is_different(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(Section),
            object_id=report_section.id,
        )
        with self.assertRaisesRegex(AppLogicError, "Invalid Attachment Content Type"):
            attachment_agency_service.delete_for_agency(
                attachment.id,
                self.another_agency_user.id,
            )

    def test_delete_for_agency_raises_exception_when_audit_store_not_acknowledged(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ASSIGNED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(
            Attachment,
            status=Attachment.UPLOADING,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
            content_type=ContentType.objects.get_for_model(ReportSection),
            object_id=report_section.id,
        )
        with self.assertRaisesRegex(AppLogicError, "Cannot delete attachment now"):
            attachment_agency_service.delete_for_agency(
                attachment.id,
                self.agency_user.id,
            )
