from django.contrib.auth.models import User, Group

from django.test import TestCase

from model_mommy import mommy
from expects import expect, equal

from kronos.exceptions import ObjectNotFound
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from auditor.models import ProfileInfo
from auditor.service import profile_info_service

class ProfileInfoServiceTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)

        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com", groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user, _fill_optional=True)

    def test_find_profile_info_by_user_id_returns_profile_info(self):
        profile_info = profile_info_service.find_profile_info_by_user_id(self.auditor_user.id)
        expect(profile_info).to(equal(self.auditor_profile))

    def test_find_profile_info_by_user_id_raises_when_profile_info_does_not_exist(self):
        with self.assertRaises(ObjectNotFound):
            profile_info_service.find_profile_info_by_user_id(32423)

    def test_find_profile_info_by_id_returns_profile_info(self):
        profile_info = profile_info_service.find_profile_info_by_id(self.auditor_profile.id)
        expect(profile_info).to(equal(self.auditor_profile))

    def test_find_profile_info_by_id_raises_when_profile_info_does_not_exist(self):
        with self.assertRaises(ObjectNotFound):
            profile_info_service.find_profile_info_by_id(32423)
