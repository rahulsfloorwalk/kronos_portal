from model_mommy import mommy
from expects import expect, have_length, equal, contain_only

from django.test import TestCase
from django.contrib.auth.models import User, Group

from kronos.exceptions import AppLogicError
from manager.models import ProofTag
from questionnaire.service.section_proof_tag import save_section_proof_tag
from registration.models import GROUP_NAME_AGENCY
from registration.models import GROUP_NAME_MANAGER
from questionnaire.service import section as section_service
from questionnaire.models import Section
from audit_store.models import AuditStore
from audit.models import AuditCycle

class SectionTestCase(TestCase):
    fixtures = ['groups']

    def setUp(self):
        self.client_group = Group.objects.get(name=GROUP_NAME_AGENCY)
        self.manager_group = Group.objects.get(name=GROUP_NAME_MANAGER)
        self.manager_user = mommy.make(User, username="manager@foobar.com", email="manager@foobar.com",
                                       groups=[self.manager_group])
        self.agency_user = mommy.make(User, username="agency_user@foobar.com", email="agency_user@foobar.com",
                                      groups=[self.client_group])

    def test_find_by_audit_store_for_agency_returns_section_list(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        audit_store = mommy.make(AuditStore, status=AuditStore.ACKNOWLEDGED, user=self.agency_user,
                                 audit__audit_cycle=audit_cycle)
        for i in range(5):
            mommy.make(Section, audit_cycle=audit_cycle)
        sections = section_service.find_by_audit_store_for_agency(audit_store.id, self.agency_user.id)
        self.assertEqual(5, len(sections))

    def test_copy_sections_from_to_copies_all_sections(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        sections = mommy.make(Section, audit_cycle=audit_cycle, minimum_attachment_count=42, _quantity=4)

        another_audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

        copied_sections = section_service.copy_sections_from_to(audit_cycle.id, another_audit_cycle.id)

        expect(copied_sections).to(have_length(len(sections)))
        for s in copied_sections:
            expect(s.audit_cycle).to(equal(another_audit_cycle))

        expect(list(map(lambda s: s.name, copied_sections))).to(contain_only(*map(lambda s: s.name, sections)))
        expect(list(map(lambda s: s.sequence, copied_sections))).to(contain_only(*map(lambda s: s.sequence, sections)))
        # expect(list(map(lambda s: s.minimum_attachment_count, copied_sections))).to(contain_only(*map(lambda s: s.minimum_attachment_count, sections)))

    def test_copy_sections_from_to_raises_if_destination_already_has_sections(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        another_audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

        mommy.make(Section, audit_cycle=audit_cycle, _quantity=4)
        mommy.make(Section, audit_cycle=another_audit_cycle, _quantity=1)

        with self.assertRaisesRegex(AppLogicError, "audit cycle already has sections"):
            section_service.copy_sections_from_to(audit_cycle.id, another_audit_cycle.id)

    def test_copy_sections_from_to_check_proof_tag_count(self):
        audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)
        sections = mommy.make(Section, audit_cycle=audit_cycle, _quantity=4)
        proof_tag_obj = mommy.make(ProofTag, _quantity=4)

        for index, tag in enumerate(proof_tag_obj):
            save_section_proof_tag(sections[index].id, audit_cycle.id, [tag.id], [tag.id])
            sections[index].refresh_from_db()

        another_audit_cycle = mommy.make(AuditCycle, status=AuditCycle.ACTIVE)

        copied_sections = section_service.copy_sections_from_to(audit_cycle.id, another_audit_cycle.id)
        expect(list(map(lambda s: s.minimum_attachment_count, copied_sections))).to(contain_only(*map(lambda s: s.minimum_attachment_count, sections)))