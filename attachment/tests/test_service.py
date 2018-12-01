import json
import base64
from datetime import date, timedelta, datetime

from model_mommy import mommy
from faker import Faker
from freezegun import freeze_time

from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from expects import expect, equal, be_none, be_an, be_a, have_key, start_with, end_with, contain

from kronos.exceptions import AppLogicError, ObjectNotFound
from attachment.models import Attachment
from attachment import service
from audit_store.models import AuditStore
from audit.models import AuditCycle
from questionnaire.models import Question, Section
from answer.models import Answer, ReportSection
from auditor.models import ProfileInfo

fake = Faker()
class AttachmentServiceTestCase(TestCase):
    AWS_SETTINGS = {
        "S3_ATTACHMENTS": {
            "AWS_ACCESS_KEY_ID": "floorwalk_access_key",
            "AWS_SECRET_ACCESS_KEY": "floorwalk_secret_access_key",
            "BUCKET": "floorwalk-attachments",
            "REGION": "ap-southeast-1",
            "MAX_SIZE": 200 * 1024 * 1024,
            "MIN_SIZE": 10,
            "FILE_SLUG_SIZE": 10,
        }
    }

    def test_check_file_size_raises_when_file_size_is_too_small(self):
        with self.settings(AWS=self.AWS_SETTINGS):
            with self.assertRaisesRegex(AppLogicError, "file is too small"):
                service.check_file_size(5)

    def test_check_file_size_raises_when_file_size_is_too_large(self):
        with self.settings(AWS=self.AWS_SETTINGS):
            with self.assertRaisesRegex(AppLogicError, "file is too large"):
                service.check_file_size(3434534435443)

    def test_check_file_size_does_not_raise_when_file_size_is_just_right(self):
        with self.settings(AWS=self.AWS_SETTINGS):
            expect(service.check_file_size(5000)).to(be_none)

    def test_parse_file_name_returns_basename_and_extension(self):
        map(lambda r: expect(service.parse_file_name(r[0])).to(equal(r[1])), [
            "Cheese Wheel.txt", ("Cheese Wheel", ".txt"),
            "/foo/bar/Cheese Wheel.txt", ("Cheese Wheel", ".txt"),
            "/foo/bar/Cheese Wheel", ("Cheese Wheel", ""),
            "/foo/bar/.foo", (".foo", ""),
            "/foo/bar/.foo.rc", (".foo", ".rc"),
        ])

    def test_valid_file_type_raises_when_mime_type_is_none(self):
        with self.assertRaisesRegex(AppLogicError, "unknown file type"):
            service.valid_file_type(None, ".png")

    def test_valid_file_type_raises_when_file_extension_is_empty(self):
        with self.assertRaisesRegex(AppLogicError, "unknown file type"):
            service.valid_file_type("image/png", "")

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

    def test_get_proof_type_returns_PHOTO_for_image(self):
        expect(service.get_proof_type("image/png")).to(equal(Attachment.PHOTO))

    def test_get_proof_type_returns_AUDIO_for_audio(self):
        expect(service.get_proof_type("audio/mpeg")).to(equal(Attachment.AUDIO))

    def test_get_proof_type_returns_VIDEO_for_videos(self):
        expect(service.get_proof_type("video/ogg")).to(equal(Attachment.VIDEO))

    def test_get_proof_type_returns_OTHER_for_other_files(self):
        expect(service.get_proof_type("application/pdf")).to(equal(Attachment.OTHER))

    def test_get_proof_type_returns_OTHER_for_unrecognized_mime_types(self):
        expect(service.get_proof_type("nfwkfne")).to(equal(Attachment.OTHER))

    def test_upload_for_object_creates_attachment(self):
        proof_type = Attachment.PHOTO
        mime_type = "image/jpeg"
        file_name = "Cheese Wheel.jpeg"
        file_size = 50000
        file_slug = "i34hv3itg"
        obj = mommy.make(AuditStore, user__email=fake.email())

        attachment = service.upload_for_object(proof_type, mime_type, file_name, file_size, file_slug, obj)

        expect(attachment.status).to(equal(Attachment.UPLOADING))
        expect(attachment.proof_type).to(equal(proof_type))
        expect(attachment.mime_type).to(equal(mime_type))
        expect(attachment.file_name).to(equal(file_name))
        expect(attachment.file_size).to(equal(file_size))
        expect(attachment.file_slug).to(equal(file_slug))
        expect(attachment.content_object).to(equal(obj))

    @freeze_time(datetime.now())
    def test_upload_for_answer_returns_post_data_and_attachment(self):
        with self.settings(AWS=self.AWS_SETTINGS):
            mime_type = "image/jpeg"
            file_extension = ".jpeg"
            file_name = "Cheese Wheel" + file_extension
            file_size = 50000
            utcnow = datetime.utcnow().replace(microsecond=0)
            expected_expiration = (utcnow + timedelta(hours=1)).isoformat() + "Z"

            S3 = self.AWS_SETTINGS["S3_ATTACHMENTS"]

            audit_cycle = mommy.make(AuditCycle)
            question = mommy.make(Question, section__audit_cycle=audit_cycle)
            audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, user__email=fake.email())

            post_data, attachment = service.upload_for_answer(audit_store.id, question.id, file_name, file_size, mime_type)

            expect(attachment.status).to(equal(Attachment.UPLOADING))
            expect(attachment.proof_type).to(equal(Attachment.PHOTO))
            expect(attachment.mime_type).to(equal(mime_type))
            expect(attachment.file_name).to(equal(file_name))
            expect(attachment.file_size).to(equal(file_size))

            expect(attachment.content_object).to(be_an(Answer))
            expect(attachment.content_object.question).to(equal(question))
            expect(attachment.content_object.audit_store).to(equal(audit_store))

            expect(post_data).to(have_key("url", "https://{}.s3.amazonaws.com/".format(S3["BUCKET"])))
            expect(post_data["fields"]).to(have_key("AWSAccessKeyId", S3["AWS_ACCESS_KEY_ID"]))
            expect(post_data["fields"]).to(have_key("acl", "public-read"))
            expect(post_data["fields"]).to(have_key("policy"))
            expect(post_data["fields"]).to(have_key("signature"))
            expect(post_data["fields"]).to(have_key("key", start_with("ATTACHMENTS/{}".format(date.today().strftime("%Y/%m/%d")))))
            expect(post_data["fields"]).to(have_key("key", end_with(file_extension)))

            policy = json.loads(base64.b64decode(post_data["fields"]["policy"]))
            expect(policy["expiration"]).to(equal(expected_expiration))
            expect(policy["conditions"]).to(contain({"acl": "public-read"}))
            expect(policy["conditions"]).to(contain(["content-length-range", S3["MIN_SIZE"], S3["MAX_SIZE"]]))
            expect(policy["conditions"]).to(contain({"bucket": S3["BUCKET"]}))
            expect(policy["conditions"]).to(contain({"success_action_status": '201'}))
            expect(policy["conditions"]).to(contain(have_key("key", start_with("ATTACHMENTS/{}".format(date.today().strftime("%Y/%m/%d"))))))
            expect(policy["conditions"]).to(contain(have_key("key", end_with(file_extension))))

    @freeze_time(datetime.now())
    def test_upload_for_report_section_returns_post_data_and_attachment(self):
        with self.settings(AWS=self.AWS_SETTINGS):
            mime_type = "image/jpeg"
            file_extension = ".jpeg"
            file_name = "Cheese Wheel" + file_extension
            file_size = 50000
            utcnow = datetime.utcnow().replace(microsecond=0)
            expected_expiration = (utcnow + timedelta(hours=1)).isoformat() + "Z"

            S3 = self.AWS_SETTINGS["S3_ATTACHMENTS"]

            audit_cycle = mommy.make(AuditCycle)
            section = mommy.make(Section, audit_cycle=audit_cycle)
            audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, user__email=fake.email())

            post_data, attachment = service.upload_for_report_section(audit_store.id, section.id, file_name, file_size, mime_type)

            expect(attachment.status).to(equal(Attachment.UPLOADING))
            expect(attachment.proof_type).to(equal(Attachment.PHOTO))
            expect(attachment.mime_type).to(equal(mime_type))
            expect(attachment.file_name).to(equal(file_name))
            expect(attachment.file_size).to(equal(file_size))

            expect(attachment.content_object).to(be_a(ReportSection))
            expect(attachment.content_object.section).to(equal(section))
            expect(attachment.content_object.audit_store).to(equal(audit_store))

            expect(post_data).to(have_key("url", "https://{}.s3.amazonaws.com/".format(S3["BUCKET"])))
            expect(post_data["fields"]).to(have_key("AWSAccessKeyId", S3["AWS_ACCESS_KEY_ID"]))
            expect(post_data["fields"]).to(have_key("acl", "public-read"))
            expect(post_data["fields"]).to(have_key("policy"))
            expect(post_data["fields"]).to(have_key("signature"))
            expect(post_data["fields"]["key"]).to(start_with("ATTACHMENTS/{}".format(date.today().strftime("%Y/%m/%d"))))
            expect(post_data["fields"]["key"]).to(end_with(file_extension))

            policy = json.loads(base64.b64decode(post_data["fields"]["policy"]))
            expect(policy["expiration"]).to(equal(expected_expiration))
            expect(policy["conditions"]).to(contain({"acl": "public-read"}))
            expect(policy["conditions"]).to(contain(["content-length-range", S3["MIN_SIZE"], S3["MAX_SIZE"]]))
            expect(policy["conditions"]).to(contain({"bucket": S3["BUCKET"]}))
            expect(policy["conditions"]).to(contain({"success_action_status": '201'}))
            expect(policy["conditions"]).to(contain(have_key("key", start_with("ATTACHMENTS/{}".format(date.today().strftime("%Y/%m/%d"))))))
            expect(policy["conditions"]).to(contain(have_key("key", end_with(file_extension))))

    @freeze_time(datetime.now())
    def test_upload_for_audit_store_returns_post_data_and_attachment(self):
        with self.settings(AWS=self.AWS_SETTINGS):
            mime_type = "image/jpeg"
            file_extension = ".jpeg"
            file_name = "Cheese Wheel" + file_extension
            file_size = 50000
            utcnow = datetime.utcnow().replace(microsecond=0)
            expected_expiration = (utcnow + timedelta(hours=1)).isoformat() + "Z"

            S3 = self.AWS_SETTINGS["S3_ATTACHMENTS"]

            audit_cycle = mommy.make(AuditCycle)
            audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, user__email=fake.email())

            post_data, attachment = service.upload_for_audit_store(audit_store.id, file_name, file_size, mime_type)

            expect(attachment.status).to(equal(Attachment.UPLOADING))
            expect(attachment.proof_type).to(equal(Attachment.PHOTO))
            expect(attachment.mime_type).to(equal(mime_type))
            expect(attachment.file_name).to(equal(file_name))
            expect(attachment.file_size).to(equal(file_size))

            expect(attachment.content_object).to(be_an(AuditStore))
            expect(attachment.content_object).to(equal(audit_store))

            expect(post_data).to(have_key("url", "https://{}.s3.amazonaws.com/".format(S3["BUCKET"])))
            expect(post_data["fields"]).to(have_key("AWSAccessKeyId", S3["AWS_ACCESS_KEY_ID"]))
            expect(post_data["fields"]).to(have_key("acl", "public-read"))
            expect(post_data["fields"]).to(have_key("policy"))
            expect(post_data["fields"]).to(have_key("signature"))
            expect(post_data["fields"]["key"]).to(start_with("ATTACHMENTS/{}".format(date.today().strftime("%Y/%m/%d"))))
            expect(post_data["fields"]["key"]).to(end_with(file_extension))

            policy = json.loads(base64.b64decode(post_data["fields"]["policy"]))
            expect(policy["expiration"]).to(equal(expected_expiration))
            expect(policy["conditions"]).to(contain({"acl": "public-read"}))
            expect(policy["conditions"]).to(contain(["content-length-range", S3["MIN_SIZE"], S3["MAX_SIZE"]]))
            expect(policy["conditions"]).to(contain({"bucket": S3["BUCKET"]}))
            expect(policy["conditions"]).to(contain({"success_action_status": '201'}))
            expect(policy["conditions"]).to(contain(have_key("key", start_with("ATTACHMENTS/{}".format(date.today().strftime("%Y/%m/%d"))))))
            expect(policy["conditions"]).to(contain(have_key("key", end_with(file_extension))))

    @freeze_time(datetime.now())
    def test_upload_for_id_proof_returns_post_data_and_attachment(self):
        with self.settings(AWS=self.AWS_SETTINGS):
            mime_type = "image/jpeg"
            file_extension = ".jpeg"
            file_name = "Cheese Wheel" + file_extension
            file_size = 50000
            utcnow = datetime.utcnow().replace(microsecond=0)
            expected_expiration = (utcnow + timedelta(hours=1)).isoformat() + "Z"

            S3 = self.AWS_SETTINGS["S3_ATTACHMENTS"]

            profile_info = mommy.make(ProfileInfo, user__email=fake.email)

            post_data, attachment = service.upload_for_id_proof(profile_info.user_id, file_name, file_size, mime_type)

            expect(attachment.status).to(equal(Attachment.UPLOADING))
            expect(attachment.proof_type).to(equal(Attachment.ID_PROOF))
            expect(attachment.mime_type).to(equal(mime_type))
            expect(attachment.file_name).to(equal(file_name))
            expect(attachment.file_size).to(equal(file_size))

            expect(attachment.content_object).to(be_a(ProfileInfo))
            expect(attachment.content_object).to(equal(profile_info))

            expect(post_data).to(have_key("url", "https://{}.s3.amazonaws.com/".format(S3["BUCKET"])))
            expect(post_data["fields"]).to(have_key("AWSAccessKeyId", S3["AWS_ACCESS_KEY_ID"]))
            expect(post_data["fields"]).to(have_key("acl", "public-read"))
            expect(post_data["fields"]).to(have_key("policy"))
            expect(post_data["fields"]).to(have_key("signature"))
            expect(post_data["fields"]["key"]).to(start_with("ATTACHMENTS/{}".format(date.today().strftime("%Y/%m/%d"))))
            expect(post_data["fields"]["key"]).to(end_with(file_extension))

            policy = json.loads(base64.b64decode(post_data["fields"]["policy"]))
            expect(policy["expiration"]).to(equal(expected_expiration))
            expect(policy["conditions"]).to(contain({"acl": "public-read"}))
            expect(policy["conditions"]).to(contain(["content-length-range", S3["MIN_SIZE"], S3["MAX_SIZE"]]))
            expect(policy["conditions"]).to(contain({"bucket": S3["BUCKET"]}))
            expect(policy["conditions"]).to(contain({"success_action_status": '201'}))
            expect(policy["conditions"]).to(contain(have_key("key", start_with("ATTACHMENTS/{}".format(date.today().strftime("%Y/%m/%d"))))))
            expect(policy["conditions"]).to(contain(have_key("key", end_with(file_extension))))

    def test_upload_for_id_proof_raises_when_mime_type_is_not_image(self):
        with self.settings(AWS=self.AWS_SETTINGS):
            mime_type = "audio/ogg"
            file_extension = ".jpeg"
            file_name = "Cheese Wheel" + file_extension
            file_size = 50000

            profile_info = mommy.make(ProfileInfo, user__email=fake.email)

            with self.assertRaisesRegex(AppLogicError, "invalid file type \\(only image or PDF supported\\)"):
                service.upload_for_id_proof(profile_info.user_id, file_name, file_size, mime_type)


    def test_get_audit_store_for_attachment_returns_audit_store_for_report_attachment(self):
        audit_cycle = mommy.make(AuditCycle)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, user__email=fake.email())
        attachment = mommy.make(Attachment, content_object=audit_store, status=Attachment.ATTACHED)

        expect(service.get_audit_store_for_attachment(attachment.id)).to(equal(audit_store))

    def test_get_audit_store_for_attachment_returns_audit_store_for_section_attachment(self):
        audit_cycle = mommy.make(AuditCycle)
        section = mommy.make(Section, audit_cycle=audit_cycle)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, user__email=fake.email())
        report_section = mommy.make(ReportSection, section=section, audit_store=audit_store)
        attachment = mommy.make(Attachment, content_object=report_section, status=Attachment.ATTACHED)

        expect(service.get_audit_store_for_attachment(attachment.id)).to(equal(audit_store))

    def test_get_audit_store_for_attachment_returns_audit_store_for_answer_attachment(self):
        audit_cycle = mommy.make(AuditCycle)
        question = mommy.make(Question, section__audit_cycle=audit_cycle)
        audit_store = mommy.make(AuditStore, audit__audit_cycle=audit_cycle, user__email=fake.email())
        answer = mommy.make(Answer, question=question, audit_store=audit_store)
        attachment = mommy.make(Attachment, content_object=answer, status=Attachment.ATTACHED)

        expect(service.get_audit_store_for_attachment(attachment.id)).to(equal(audit_store))

    def test_get_audit_store_for_attachment_raises_when_content_object_is_not_a_report_child_object(self):
        profile_info = mommy.make(ProfileInfo, user__email=fake.email)
        attachment = mommy.make(Attachment, content_object=profile_info, status=Attachment.ID_PROOF)

        with self.assertRaisesRegex(AppLogicError, "Invalid Attachment Content Type"):
            service.get_audit_store_for_attachment(attachment.id)

    def test_get_audit_store_for_attachment_raises_when_attachment_is_not_found(self):
        with self.assertRaises(ObjectNotFound):
            service.get_audit_store_for_attachment(123)

    def test_get_audit_store_for_attachment_raises_when_attachment_is_orphaned(self):
        attachment = mommy.make(Attachment, object_id=4, content_type=ContentType.objects.get_for_model(AuditStore), status=Attachment.PHOTO)

        with self.assertRaises(ObjectNotFound):
            service.get_audit_store_for_attachment(attachment.id)
