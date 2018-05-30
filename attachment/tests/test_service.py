from model_mommy import mommy
from faker import Faker

from django.test import TestCase

from kronos.exceptions import AppLogicError
from attachment.models import Attachment
from attachment import service

fake = Faker()
class AttachmentServiceTestCase(TestCase):

    def test_rename_renames_file(self):
        attachment = mommy.make(Attachment, file_name="hello_world.jpg")
        attachment = service.rename(attachment.id, "new_name")
        self.assertEqual("new_name", attachment.file_name)

    def test_rename_raises_when_name_is_none(self):
        attachment = mommy.make(Attachment, file_name="hello_world.jpg")
        with self.assertRaisesRegex(AppLogicError, "new file name is invalid"):
            attachment = service.rename(attachment.id, None)

    def test_rename_raises_when_name_is_empty(self):
        attachment = mommy.make(Attachment, file_name="hello_world.jpg")
        with self.assertRaisesRegex(AppLogicError, "new file name is invalid"):
            attachment = service.rename(attachment.id, "")

