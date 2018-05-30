from django.test import TestCase, override_settings
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType

from model_mommy import mommy
from model_mommy.recipe import Recipe

from guardian.shortcuts import assign_perm

from kronos.exceptions import AppLogicError
from attachment.models import Attachment
from questionnaire.models import Section
from attachment import service_moderator as attachment_moderator_service
from audit_store.models import AuditStore
from audit.models import AuditCycle
from registration.models import GROUP_NAME_MODERATOR, GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo

class AttachmentModeratorServiceTestCase(TestCase):
    fixtures = ['groups']

    test_aws_settings = {
        "S3_ATTACHMENTS": {
            "AWS_ACCESS_KEY_ID": "foo",
            "AWS_SECRET_ACCESS_KEY": "bar",
            "BUCKET": "test_bucket",
            "REGION": "test_region",
            "MIN_SIZE": 10,
            "MAX_SIZE": 1024 * 1024,
            "FILE_SLUG_SIZE": 100,
        }
    }

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User, username="moderator@foobar.com", email="moderator@foobar.com",
                                         groups=[self.moderator_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)

    @override_settings(AWS = test_aws_settings)
    def test_upload_for_audit_store_for_moderator_creates_attachment_based_on_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            test_file = "hello_world.jpg"
            test_mime_type = "image/jpeg"
            test_size = 2048
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

    @override_settings(AWS = test_aws_settings)
    def test_upload_for_report_section_for_moderator_creates_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            section = mommy.make(Section, audit_cycle=audit_cycle)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            test_file = "hello_world.jpg"
            test_mime_type = "image/jpeg"
            test_size = 2048
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

    @override_settings(AWS = test_aws_settings)
    def test_complete_for_moderator_completes_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
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

    @override_settings(AWS = test_aws_settings)
    def test_delete_for_moderator_deletes_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
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

    @override_settings(AWS = test_aws_settings)
    def test_rename_for_moderator_renames_attachment_based_on_audit_store_status(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
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

