from django.test import TestCase
from django.contrib.auth.models import User, Group

from model_mommy import mommy
from model_mommy.recipe import Recipe

from guardian.shortcuts import assign_perm

from kronos.exceptions import AppLogicError
from answer.models import Answer
from answer.service import answer_moderator as answer_moderator_service
from audit.models import AuditCycle
from audit_store.models import AuditStore
from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR
from auditor.models import ProfileInfo

class AnswerModeratorServiceTestCase(TestCase):
    fixtures = ['groups', 'city']

    def setUp(self):
        self.auditor_group = Group.objects.get(name=GROUP_NAME_AUDITOR)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.auditor_user = mommy.make(User, username="auditor@foobar.com", email="auditor@foobar.com",
                                       groups=[self.auditor_group])
        self.auditor_profile = mommy.make(ProfileInfo, user=self.auditor_user)
        self.moderator_group = Group.objects.get(name=GROUP_NAME_MODERATOR)
        self.moderator_user = mommy.make(User,
                                         username="moderator@foobar.com",
                                         email="moderator@foobar.com",
                                             groups=[self.moderator_group])

    def test_set_not_applicable_for_moderator_sets_not_applicable(self):
        audit_store_recipe = Recipe(AuditStore, user=self.auditor_user)
        for status in [s[0] for s in AuditStore.STATUS if s[0] is not AuditStore.WITHDRAWN]:
            audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
            audit_store = audit_store_recipe.make(status=status, audit__audit_cycle=audit_cycle)
            assign_perm('audit_store.moderator_manage', self.moderator_user, audit_store)
            answer = mommy.make(Answer, audit_store=audit_store, question__section__audit_cycle=audit_cycle)
            if audit_store.status in audit_store._MODERATOR_EDITABLE_STATUSES:
                saved_answer = answer_moderator_service.set_not_applicable_for_moderator(
                    audit_store.id,
                    answer.question.id,
                    True,
                    self.moderator_user.id
                )
                self.assertTrue(saved_answer.not_applicable)
            else:
                with self.assertRaises(AppLogicError):
                    answer_moderator_service.set_not_applicable_for_moderator(
                        audit_store.id,
                        answer.question.id,
                        True,
                        self.moderator_user.id
                    )