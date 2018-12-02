
from django.test import TestCase, override_settings
from django.contrib.auth.models import User, Group

from expects import expect, equal, have_length
from model_mommy import mommy
from model_mommy.recipe import Recipe

from kronos.exceptions import AppLogicError, ObjectNotFound
from attachment.models import Attachment
from questionnaire.models import Section
from answer.models import ReportSection
from attachment import service
from attachment import service_auditor
from audit_store.models import AuditStore
from audit.models import AuditCycle
from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

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
class AttachmentAuditorServiceTestCase(TestCase):
    fixtures = ['groups']

    test_file = "hello_world.jpg"
    test_mime_type = "image/jpeg"
    test_size = 2048

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com", groups=[self.auditor_group])
        self.profile_info = mommy.make(ProfileInfo, user=self.auditor_user)

        self.another_auditor_user = mommy.make(User, username="another_auditor@foobar.com", email="another_auditor@foobar.com", groups=[self.auditor_group])
        self.another_profile_info = mommy.make(ProfileInfo, user=self.another_auditor_user)

        self.audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        self.audit_store_recipe = Recipe(
            AuditStore,
            status=AuditStore.ACKNOWLEDGED,
            user=self.auditor_user,
            audit__audit_cycle=self.audit_cycle,
        )
        self.attachment_recipe = Recipe(
            Attachment,
            proof_type=Attachment.PHOTO,
            file_name=self.test_file,
            file_size=self.test_size,
            mime_type=self.test_mime_type,
        )

    def test_upload_for_audit_store_for_auditor_creates_attachment(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ACKNOWLEDGED)
        post_data, created_attachment = service_auditor.upload_for_audit_store_by_auditor(
            audit_store.id,
            self.auditor_user.id,
            self.test_file,
            self.test_size,
            self.test_mime_type,
        )
        expect(created_attachment.file_name).to(equal(self.test_file))
        expect(created_attachment.file_size).to(equal(self.test_size))
        expect(created_attachment.mime_type).to(equal(self.test_mime_type))
        expect(created_attachment.proof_type).to(equal(Attachment.PHOTO))
        expect(created_attachment.status).to(equal(Attachment.UPLOADING))

    def test_upload_for_report_section_for_auditor_creates_attachment(self):
        audit_store = self.audit_store_recipe.make()
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048
        post_data, created_attachment = service_auditor.upload_for_report_section_by_auditor(
            audit_store.id,
            section.id,
            self.test_file,
            self.test_size,
            self.test_mime_type,
            self.auditor_user.id,
        )
        expect(created_attachment.file_name).to(equal(test_file))
        expect(created_attachment.file_size).to(equal(test_size))
        expect(created_attachment.mime_type).to(equal(test_mime_type))
        expect(created_attachment.proof_type).to(equal(Attachment.PHOTO))
        expect(created_attachment.status).to(equal(Attachment.UPLOADING))

    def test_upload_for_id_proof_for_auditor_creates_attachment(self):
        post_data, created_attachment = service_auditor.upload_for_id_proof_by_auditor(
            self.auditor_user.id,
            self.test_file,
            self.test_size,
            self.test_mime_type,
        )
        expect(created_attachment.file_name).to(equal(self.test_file))
        expect(created_attachment.file_size).to(equal(self.test_size))
        expect(created_attachment.mime_type).to(equal(self.test_mime_type))
        expect(created_attachment.proof_type).to(equal(Attachment.ID_PROOF))
        expect(created_attachment.status).to(equal(Attachment.UPLOADING))

    def test_find_id_proof_for_auditor_returns_attachment(self):
        test_attachment = self.attachment_recipe.make(
            status=Attachment.ATTACHED,
            proof_type=Attachment.ID_PROOF,
            content_object=self.profile_info,
        )
        attachments = service_auditor.find_id_proof_for_auditor(self.auditor_user.id)
        expect(attachments).to(have_length(1))
        expect(attachments[0]).to(equal(test_attachment))

    def test_find_by_audit_store_for_auditor_returns_attachment(self):
        audit_store = self.audit_store_recipe.make()
        test_attachment = self.attachment_recipe.make(status=Attachment.ATTACHED, content_object=audit_store)
        attachments = service_auditor.find_by_audit_store_for_auditor(
            audit_store.id,
            self.auditor_user.id,
        )
        expect(attachments).to(have_length(1))
        expect(attachments[0]).to(equal(test_attachment))

    def test_find_by_audit_store_and_section_for_auditor_returns_attachment(self):
        audit_store = self.audit_store_recipe.make()
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        test_attachment = self.attachment_recipe.make(status=Attachment.ATTACHED, content_object=report_section)
        attachments = service_auditor.find_by_audit_store_and_section_for_auditor(
            audit_store.id,
            section.id,
            self.auditor_user.id,
        )

        expect(attachments).to(have_length(1))
        expect(attachments[0]).to(equal(test_attachment))

    def test_complete_for_auditor_changes_status_to_attached(self):
        audit_store = self.audit_store_recipe.make()
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = self.attachment_recipe.make(status=Attachment.UPLOADING, content_object=report_section)
        completed_attachment = service_auditor.complete_for_auditor(
            attachment.id,
            self.auditor_user.id,
        )
        expect(completed_attachment.status).to(equal(Attachment.ATTACHED))

    def test_complete_for_auditor_raises_exception_when_user_is_different(self):
        audit_store = self.audit_store_recipe.make()
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = self.attachment_recipe.make(status=Attachment.UPLOADING, content_object=report_section)
        with self.assertRaises(ObjectNotFound):
            service_auditor.complete_for_auditor(
                attachment.id,
                self.another_auditor_user.id,
            )

    def test_complete_for_auditor_raises_exception_when_contenttype_is_different(self):
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        attachment = self.attachment_recipe.make(status=Attachment.UPLOADING, content_object=section)
        with self.assertRaisesRegex(AppLogicError, "Invalid Attachment Content Type detected"):
            service_auditor.complete_for_auditor(
                attachment.id,
                self.another_auditor_user.id,
            )

    def test_complete_for_auditor_raises_exception_when_audit_store_not_acknowledged(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ASSIGNED)
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = self.attachment_recipe.make(status=Attachment.UPLOADING, content_object=report_section)
        with self.assertRaisesRegex(AppLogicError, "cannot complete attachment now"):
            service_auditor.complete_for_auditor(
                attachment.id,
                self.auditor_user.id,
            )

    def test_delete_for_auditor_changes_status_as_deleted(self):
        audit_store = self.audit_store_recipe.make()
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = self.attachment_recipe.make(status=Attachment.ATTACHED, content_object=report_section)
        service_auditor.delete_for_auditor(
            attachment.id,
            self.auditor_user.id,
        )
        deleted_attachment = service.find_by_id(attachment.id)
        self.assertEqual(Attachment.DELETED, deleted_attachment.status)

    def test_delete_for_auditor_raises_exception_when_report_status_is_not_acknowledged(self):
        audit_store = self.audit_store_recipe.make(status=AuditStore.ASSIGNED)
        section = mommy.make(Section, audit_cycle=self.audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = self.attachment_recipe.make(status=Attachment.UPLOADING, content_object=report_section)
        with self.assertRaisesRegex(AppLogicError, "cannot delete attachment now"):
            service_auditor.delete_for_auditor(
                attachment.id,
                self.auditor_user.id,
            )
