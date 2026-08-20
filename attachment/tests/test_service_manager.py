from django.test import TestCase, override_settings
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType

from expects import expect, be_a, be_an, contain_only
from model_mommy import mommy
from model_mommy.recipe import Recipe
from faker import Faker

from kronos.exceptions import AppLogicError
from attachment.models import Attachment
from questionnaire.models import Section, Question, SectionProofTag
from manager.models import ProofTag
from questionnaire.models.proof_tag import AuditCycleProofTagList
from attachment import service_manager as attachment_manager_service
from audit_store.models import AuditStore
from audit.models import AuditCycle
from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo
from answer.models import ReportSection, Answer

fake = Faker()

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
class AttachmentManagerServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_upload_for_audit_store_for_manager_creates_attachment_based_on_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048

        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                post_data, created_attachment = attachment_manager_service.upload_for_audit_store_for_manager(
                    audit_store.id,
                    test_file,
                    test_size,
                    test_mime_type,
                )
                self.assertEqual(test_file, created_attachment.file_name)
                self.assertEqual(test_size, created_attachment.file_size)
                self.assertEqual(test_mime_type, created_attachment.mime_type)
                self.assertEqual(Attachment.PHOTO, created_attachment.proof_type)
                self.assertEqual(Attachment.UPLOADING, created_attachment.status)
                expect(created_attachment.content_object).to(be_an(AuditStore))
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot upload attachment now"):
                    attachment_manager_service.upload_for_audit_store_for_manager(
                        audit_store.id,
                        test_file,
                        test_size,
                        test_mime_type,
                    )

    def test_upload_for_report_section_for_manager_creates_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048

        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            section = mommy.make(Section, audit_cycle=audit_cycle)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                post_data, created_attachment = attachment_manager_service.upload_for_report_section_for_manager(
                    audit_store.id,
                    section.id,
                    test_file,
                    test_size,
                    test_mime_type,
                    self.manager_user.id,
                )
                self.assertEqual(test_file, created_attachment.file_name)
                self.assertEqual(test_size, created_attachment.file_size)
                self.assertEqual(test_mime_type, created_attachment.mime_type)
                self.assertEqual(Attachment.PHOTO, created_attachment.proof_type)
                self.assertEqual(Attachment.UPLOADING, created_attachment.status)
                expect(created_attachment.content_object).to(be_a(ReportSection))
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot upload attachment now"):
                    attachment_manager_service.upload_for_report_section_for_manager(
                        audit_store.id,
                        section.id,
                        test_file,
                        test_size,
                        test_mime_type,
                        self.manager_user.id,
                    )

    def test_upload_for_answer_for_manager_creates_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048

        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            question = mommy.make(Question, section__audit_cycle=audit_cycle)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                post_data, created_attachment = attachment_manager_service.upload_for_answer_for_manager(
                    audit_store.id,
                    question.id,
                    test_file,
                    test_size,
                    test_mime_type,
                    self.manager_user.id,
                )
                self.assertEqual(test_file, created_attachment.file_name)
                self.assertEqual(test_size, created_attachment.file_size)
                self.assertEqual(test_mime_type, created_attachment.mime_type)
                self.assertEqual(Attachment.PHOTO, created_attachment.proof_type)
                self.assertEqual(Attachment.UPLOADING, created_attachment.status)
                expect(created_attachment.content_object).to(be_an(Answer))
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot upload attachment now"):
                    attachment_manager_service.upload_for_answer_for_manager(
                        audit_store.id,
                        question.id,
                        test_file,
                        test_size,
                        test_mime_type,
                        self.manager_user.id,
                    )

    def test_complete_for_manager_completes_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            attachment = mommy.make(
                Attachment,
                status=Attachment.ATTACHED,
                file_size=2048,
                content_type=ContentType.objects.get_for_model(AuditStore),
                object_id=audit_store.id,
            )
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                attachment = attachment_manager_service.complete_for_manager(attachment.id)
                self.assertEqual(Attachment.ATTACHED, attachment.status)
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot complete attachment now"):
                    attachment_manager_service.complete_for_manager(attachment.id)

    def test_delete_for_manager_deletes_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            attachment = mommy.make(
                Attachment,
                status=Attachment.ATTACHED,
                file_size=2048,
                content_type=ContentType.objects.get_for_model(AuditStore),
                object_id=audit_store.id,
            )
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                attachment_manager_service.delete_for_manager(attachment.id)
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot delete attachment now"):
                    attachment_manager_service.delete_for_manager(attachment.id)

    def test_rename_for_manager_renames_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            attachment = mommy.make(
                Attachment,
                status=Attachment.ATTACHED,
                file_size=2048,
                content_type=ContentType.objects.get_for_model(AuditStore),
                object_id=audit_store.id,
            )
            if audit_store.status in audit_store._MANAGER_EDITABLE_STATUSES:
                attachment = attachment_manager_service.rename_for_manager(attachment.id, "new name")
                self.assertEqual("new name", attachment.file_name)
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot rename attachment now"):
                    attachment_manager_service.rename_for_manager(attachment.id, "new name")

    def test_find_by_audit_store_for_manager_returns_attachment(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email)

        attachment = mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_size=2048,
            content_object=audit_store,
        )
        attachments = attachment_manager_service.find_by_audit_store_for_manager(audit_store.id)
        expect(list(attachments)).to(contain_only(attachment))

    # def test_find_by_audit_store_and_section_for_manager_returns_attachment(self):
    #     audit_cycle = mommy.make(AuditCycle)
    #     audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, audit__audit_cycle=audit_cycle, user__email=fake.email)
    #     section = mommy.make(Section, audit_cycle=audit_cycle)
    #     report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)

    #     test_attachment = mommy.make(Attachment, status=Attachment.ATTACHED, content_object=report_section)
    #     attachments = attachment_manager_service.find_by_audit_store_and_section_for_manager(
    #         audit_store.id,
    #         section.id,
    #         self.manager_user.id,
    #     )

    #     expect(list(attachments)).to(contain_only(test_attachment))

    def test_find_by_audit_store_and_section_for_manager_returns_attachment(self):
        audit_cycle = mommy.make(AuditCycle)
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, audit__audit_cycle=audit_cycle, user__email=fake.email)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        proof_tag = mommy.make(ProofTag)
        audit_cycle_proof_tag = mommy.make(AuditCycleProofTagList, audit_cycle=audit_cycle, proof_tag=proof_tag)
        mommy.make(SectionProofTag, audit_cycle_proof_tag=audit_cycle_proof_tag, section=section, hide_from_client=False)
        test_attachment = mommy.make(Attachment, status=Attachment.ATTACHED, content_object=report_section, proof_tag=audit_cycle_proof_tag)
        attachments = attachment_manager_service.find_by_audit_store_and_section_for_manager(audit_store.id, section.id, self.manager_user.id)
        expect(list(attachments)).to(contain_only(test_attachment))