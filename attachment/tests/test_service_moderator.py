from django.test import TestCase, override_settings
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType

from expects import expect, be_a, be_an, contain_only
from model_mommy import mommy
from model_mommy.recipe import Recipe
from faker import Faker

from guardian.shortcuts import assign_perm

from kronos.exceptions import AppLogicError
from attachment.models import Attachment
from questionnaire.models import Section, Question,SectionProofTag
from questionnaire.models.proof_tag import AuditCycleProofTagList
from manager.models import ProofTag
from answer.models import ReportSection, Answer
from attachment import service_moderator as attachment_moderator_service
from audit_store.models import AuditStore
from audit.models import AuditCycle
from registration.models import GROUP_NAME_MODERATOR, GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

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
class AttachmentModeratorServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User, username="moderator@foobar.com", email="moderator@foobar.com",
                                         groups=[self.moderator_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    def test_upload_for_audit_store_for_moderator_creates_attachment_based_on_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048

        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN and s[0] is not AuditStore.AUDITOR_WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                post_data, created_attachment = attachment_moderator_service.upload_for_audit_store_for_moderator(
                    audit_store.id,
                    self.moderator_user.id,
                    test_file,
                    test_size,
                    test_mime_type,
                )
                self.assertEqual(test_file, created_attachment.file_name)
                self.assertEqual(test_size, created_attachment.file_size)
                self.assertEqual(test_mime_type, created_attachment.mime_type)
                self.assertEqual(Attachment.PHOTO, created_attachment.proof_type)
                self.assertEqual(Attachment.UPLOADING, created_attachment.status)
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot upload attachment now"):
                    attachment_moderator_service.upload_for_audit_store_for_moderator(
                        audit_store.id,
                        self.moderator_user.id,
                        test_file,
                        test_size,
                        test_mime_type,
                    )

    def test_upload_for_report_section_for_moderator_creates_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048

        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN and s[0] is not AuditStore.AUDITOR_WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            section = mommy.make(Section, audit_cycle=audit_cycle)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                post_data, created_attachment = attachment_moderator_service.upload_for_report_section_for_moderator(
                    audit_store.id,
                    section.id,
                    test_file,
                    test_size,
                    test_mime_type,
                    self.moderator_user.id,
                )
                self.assertEqual(test_file, created_attachment.file_name)
                self.assertEqual(test_size, created_attachment.file_size)
                self.assertEqual(test_mime_type, created_attachment.mime_type)
                self.assertEqual(Attachment.PHOTO, created_attachment.proof_type)
                self.assertEqual(Attachment.UPLOADING, created_attachment.status)
                expect(created_attachment.content_object).to(be_a(ReportSection))
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot upload attachment now"):
                    attachment_moderator_service.upload_for_report_section_for_moderator(
                        audit_store.id,
                        section.id,
                        test_file,
                        test_size,
                        test_mime_type,
                        self.moderator_user.id,
                    )

    def test_upload_for_answer_for_moderator_creates_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        test_file = "hello_world.jpg"
        test_mime_type = "image/jpeg"
        test_size = 2048

        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN and s[0] is not AuditStore.AUDITOR_WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            question = mommy.make(Question, section__audit_cycle=audit_cycle)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                post_data, created_attachment = attachment_moderator_service.upload_for_answer_for_moderator(
                    audit_store.id,
                    question.id,
                    test_file,
                    test_size,
                    test_mime_type,
                    self.moderator_user.id,
                )
                self.assertEqual(test_file, created_attachment.file_name)
                self.assertEqual(test_size, created_attachment.file_size)
                self.assertEqual(test_mime_type, created_attachment.mime_type)
                self.assertEqual(Attachment.PHOTO, created_attachment.proof_type)
                self.assertEqual(Attachment.UPLOADING, created_attachment.status)
                expect(created_attachment.content_object).to(be_an(Answer))
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot upload attachment now"):
                    attachment_moderator_service.upload_for_answer_for_moderator(
                        audit_store.id,
                        question.id,
                        test_file,
                        test_size,
                        test_mime_type,
                        self.moderator_user.id,
                    )

    def test_complete_for_moderator_completes_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN and s[0] is not AuditStore.AUDITOR_WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            attachment = mommy.make(
                Attachment,
                status=Attachment.ATTACHED,
                file_size=2048,
                content_type=ContentType.objects.get_for_model(AuditStore),
                object_id=audit_store.id,
            )
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                attachment = attachment_moderator_service.complete_for_moderator(attachment.id, self.moderator_user.id)
                self.assertEqual(Attachment.ATTACHED, attachment.status)
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot complete attachment now"):
                    attachment_moderator_service.complete_for_moderator(attachment.id, self.moderator_user.id)

    def test_delete_for_moderator_deletes_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN and s[0] is not AuditStore.AUDITOR_WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            attachment = mommy.make(
                Attachment,
                status=Attachment.ATTACHED,
                file_size=2048,
                content_type=ContentType.objects.get_for_model(AuditStore),
                object_id=audit_store.id,
            )
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                attachment_moderator_service.delete_for_moderator(attachment.id, self.moderator_user.id)
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot delete attachment now"):
                    attachment_moderator_service.delete_for_moderator(attachment.id, self.moderator_user.id)

    def test_rename_for_moderator_renames_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN and s[0] is not AuditStore.AUDITOR_WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            attachment = mommy.make(
                Attachment,
                status=Attachment.ATTACHED,
                file_size=2048,
                content_type=ContentType.objects.get_for_model(AuditStore),
                object_id=audit_store.id,
            )
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                attachment = attachment_moderator_service.rename_for_moderator(attachment.id, self.moderator_user.id, "new name")
                self.assertEqual("new name", attachment.file_name)
            else:
                with self.assertRaisesRegex(AppLogicError, "cannot rename attachment now"):
                    attachment_moderator_service.rename_for_moderator(attachment.id, self.moderator_user.id, "new name")

    def test_find_by_audit_store_for_moderator_returns_attachment(self):
        audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, user__email=fake.email)
        assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)

        attachment = mommy.make(
            Attachment,
            status=Attachment.ATTACHED,
            file_size=2048,
            content_object=audit_store,
        )
        attachments = attachment_moderator_service.find_by_audit_store_for_moderator(
            audit_store.id,
            self.moderator_user.id,
        )
        expect(list(attachments)).to(contain_only(attachment))

    # def test_find_by_audit_store_and_section_for_moderator_returns_attachment(self):
    #     audit_cycle = mommy.make(AuditCycle)
    #     audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, audit__audit_cycle=audit_cycle, user__email=fake.email)
    #     section = mommy.make(Section, audit_cycle=audit_cycle)
    #     report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
    #     assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)

    #     test_attachment = mommy.make(Attachment, status=Attachment.ATTACHED, content_object=report_section)
    #     attachments = attachment_moderator_service.find_by_audit_store_and_section_for_moderator(
    #         audit_store.id,
    #         section.id,
    #         self.moderator_user.id,
    #     )

    #     expect(list(attachments)).to(contain_only(test_attachment))

    # def test_find_by_audit_store_and_section_for_moderator_returns_attachment(self):
    #     audit_cycle = mommy.make(AuditCycle)
    #     audit_store = mommy.make(AuditStore, status=AuditStore.SUBMITTED, audit__audit_cycle=audit_cycle, user__email=fake.email)
    #     section = mommy.make(Section, audit_cycle=audit_cycle)
    #     report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
    #     assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
    #     proof_tag = mommy.make(ProofTag)
    #     audit_cycle_proof_tag = mommy.make(AuditCycleProofTagList, audit_cycle=audit_cycle, proof_tag=proof_tag)
    #     mommy.make(SectionProofTag, audit_cycle_proof_tag=audit_cycle_proof_tag, section=section, hide_from_client=False)
    #     test_attachment = mommy.make(Attachment, status=Attachment.ATTACHED, content_object=report_section, proof_tag=audit_cycle_proof_tag)
    #     attachments = attachment_moderator_service.find_by_audit_store_and_section_for_moderator(audit_store.id, section.id, self.moderator_user.id)
    #     expect(list(attachments)).to(contain_only(test_attachment))