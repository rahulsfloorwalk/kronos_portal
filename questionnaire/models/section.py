from django.db.models import Model, CharField, AutoField, ForeignKey, PositiveIntegerField, IntegerField
from django.db.models import PROTECT, F, Value, Sum
from django.db.models.functions import Coalesce

class Section(Model):

    id = AutoField(db_column = 'id', primary_key=True)
    name = CharField(db_column="name", max_length=100, blank=False)
    audit_cycle = ForeignKey('audit.AuditCycle', related_name='sections', db_column='audit_cycle_id', blank=False, on_delete=PROTECT)
    sequence = PositiveIntegerField(db_column='sequence', blank=False)
    minimum_attachment_count = IntegerField(db_column='minimum_attachment_count', default=0, blank=False)

    def __str__(self):
        return 'Section({}): {}'.format(self.id, self.name)

    def max_marks(self):
        '''may return zero so make sure you check for DivideByZero before using this blindly in the denominator'''
        # check if prefetched cache exists,
        if hasattr(self, '_prefetched_objects_cache') and 'questions' in self._prefetched_objects_cache:
            # run the summing code in python because we have already prefetched questions
            return sum(q.max_marks for q in self.questions.all() if type(q.max_marks) is int)
        else:
            return self.questions.aggregate(
                max_marks=Coalesce(
                    Sum(F('max_marks')),
                    Value(0)
                )
            )["max_marks"]

    class Meta:
        ordering = ['sequence']
