from model_mommy import mommy
from expects import expect, equal
from faker import Faker

from django.test import TestCase, override_settings

from attachment.models import Attachment

from django.conf import settings

fake = Faker()
class AttachmentTestCase(TestCase):

    test_imgix_subdomain = "imgix_domain"
    test_thumbor_subdomain = "thumbor_domain"

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

    # @override_settings(IMGIX_SUBDOMAIN = test_imgix_subdomain)
    # def test_extra_returns_correct_data_when_proof_type_is_photo(self):
    #     attachment = mommy.make(Attachment, file_slug="foo/bar", proof_type=Attachment.PHOTO)
    #     self.assertEqual(
    #         attachment.extra(),
    #         {
    #             "thumbnail_url": "https://imgix_domain/foo/bar?fit=crop&auto=enhance,compress&crop=entropy&w=150&h=100",
    #             "preview_url": "https://imgix_domain/foo/bar?auto=enhance,compress&h=500",
    #         }
    #     )

    @override_settings(THUMBOR_SUBDOMAIN=test_thumbor_subdomain)
    def test_extra_returns_correct_data_when_proof_type_is_photo(self):
        attachment = mommy.make(Attachment, file_slug='foo/bar', proof_type=Attachment.PHOTO)
        s3 = settings.AWS["S3_ATTACHMENTS"]
        s3_url = "https://s3-{}.amazonaws.com/{}".format(s3["REGION"], s3["BUCKET"])
        self.assertEqual(
            attachment.extra(),
            {
                "thumbnail_url": "https://thumbor_domain/unsafe/150x100/smart/{}/foo/bar".format(s3_url),
                "preview_url": "https://thumbor_domain/unsafe/0x500/smart/{}/foo/bar".format(s3_url),

            }
        )

    def test_extra_returns_empty_dict_when_proof_type_is_not_photo(self):
        for proof_type in [p[0] for p in Attachment.PROOF_TYPE if p[0] is not Attachment.PHOTO]:
            with self.subTest(proof_type=proof_type):
                attachment = mommy.make(Attachment, file_slug="foo/bar", proof_type=proof_type)
                expect(attachment.extra()).to(equal({}))
