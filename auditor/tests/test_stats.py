from faker import Faker

from model_mommy import mommy
# from model_mommy.recipe import Recipe

from django.test import TestCase

from django.contrib.auth.models import User, Group

from registration.models import GROUP_NAME_AUDITOR
from manager.models import City
from auditor.service import stats

from ..models import ProfileInfo, BankInfo, AdditionalInfo
from attachment.models import Attachment
from social.models import Facebook

fake = Faker()

class StatsTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.email = fake.email()
        self.password = fake.password()
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)

        self.city = City.objects.get(pk=473)

        self.auditor_user = mommy.make(User, username=self.email, email=self.email, groups=[self.auditor_group])
        self.auditor_user.set_password(self.password)
        self.auditor_user.save()

    def complete_profile_info(self):
        self.profile = mommy.make(ProfileInfo, mobile_number=fake.numerify("##########"), user=self.auditor_user, _fill_optional=True)

    def complete_bank_info(self):
        self.bank_info = mommy.make(BankInfo, user=self.auditor_user, _fill_optional=True)

    def complete_additional_info(self):
        self.additional_info = mommy.make(AdditionalInfo, user=self.auditor_user, laptop_owned=False, has_car=False, _fill_optional=True)
    def complete_id_proof(self):
        self.attachment = mommy.make(Attachment, content_object=self.profile, proof_type=Attachment.ID_PROOF, status=Attachment.ATTACHED, _fill_optional=True)

    def complete_social_info(self):
        self.social_info = mommy.make(Facebook, user=self.auditor_user, is_verified=True, _fill_optional=True)

    def test_profile_percentage_with_profile(self):
        """checks if ProfileInfo is 25%"""

        self.complete_profile_info()
        self.assertTrue(self.profile.is_complete())
        self.assertEqual(stats.get_profile_percentage(self.auditor_user.id), 25)

    def test_profile_percentage_with_profile_and_bank(self):
        """checks if ProfileInfo, BankInfo is 50%"""

        self.complete_profile_info()
        self.assertTrue(self.profile.is_complete())

        self.complete_bank_info()
        self.assertTrue(self.bank_info.is_complete())

        self.assertEqual(stats.get_profile_percentage(self.auditor_user.id), 50)

    def test_profile_percentage_with_profile_and_bank_and_additional(self):
        """checks if ProfileInfo, BankInfo, AdditionalInfo is 60%"""

        self.complete_profile_info()
        self.assertTrue(self.profile.is_complete())

        self.complete_bank_info()
        self.assertTrue(self.bank_info.is_complete())

        self.complete_additional_info()
        self.assertTrue(self.additional_info.is_complete())

        self.assertEqual(stats.get_profile_percentage(self.auditor_user.id), 60)

    def test_profile_percentage_with_profile_and_bank_and_additional_and_id_proof(self):
        """checks if ProfileInfo, BankInfo, AdditionalInfo, IdProof is 80%"""

        self.complete_profile_info()
        self.assertTrue(self.profile.is_complete())

        self.complete_bank_info()
        self.assertTrue(self.bank_info.is_complete())

        self.complete_additional_info()
        self.assertTrue(self.additional_info.is_complete())

        self.complete_id_proof()
        self.assertEqual(stats.get_profile_percentage(self.auditor_user.id), 80)

    def test_profile_percentage_with_profile_and_bank_and_additional_and_id_proof_and_social(self):
        """checks if ProfileInfo, BankInfo, AdditionalInfo, IdProof, SocialInfo is 100%"""

        self.complete_profile_info()
        self.assertTrue(self.profile.is_complete())

        self.complete_bank_info()
        self.assertTrue(self.bank_info.is_complete())

        self.complete_additional_info()
        self.assertTrue(self.additional_info.is_complete())

        self.complete_id_proof()
        self.complete_social_info()

        self.assertEqual(stats.get_profile_percentage(self.auditor_user.id), 100)

