from django.test import TestCase

from model_mommy import mommy
from model_mommy.recipe import Recipe

from audit.models import Audit, AuditCycle

class AuditCycleTestCase(TestCase):

    def test_audit_count(self):
        audit_cycle = mommy.make(AuditCycle)
        recipe = Recipe(Audit, audit_cycle=audit_cycle)
        recipe.make(count=3)
        recipe.make(count=9)
        recipe.make(count=1)

        self.assertEqual(13, audit_cycle.audit_count())

