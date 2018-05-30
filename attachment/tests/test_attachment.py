from model_mommy import mommy
from faker import Faker

from django.test import TestCase, override_settings

from attachment.models import Attachment

fake = Faker()
class AttachmentTestCase(TestCase):

    test_imgix_subdomain = "imgix_domain"

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

    @override_settings(AWS = test_aws_settings)
    def test_direct_url_returns_correct_url(self):
        attachment = mommy.make(Attachment, file_slug="foo/bar")
        self.assertEqual(
            attachment.direct_url(),
            "https://s3-test_region.amazonaws.com/test_bucket/foo/bar",
        )

    @override_settings(IMGIX_SUBDOMAIN = test_imgix_subdomain)
    def test_extra_returns_correct_data_when_proof_type_is_photo(self):
        attachment = mommy.make(Attachment, file_slug="foo/bar", proof_type=Attachment.PHOTO)
        self.assertEqual(
            attachment.extra(),
            {
                "thumbnail_url": "https://imgix_domain/foo/bar?fit=crop&auto=enhance,compress&crop=entropy&w=150&h=100",
                "preview_url": "https://imgix_domain/foo/bar?auto=enhance,compress&h=500",
            }
        )
