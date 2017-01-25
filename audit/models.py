from django.conf import settings
from django.db.models import Model, CharField, IntegerField, AutoField, DateField, EmailField, ForeignKey, NullBooleanField, OneToOneField, PositiveIntegerField
from django.db.models import CASCADE

class AuditCycle(Model):
    db_table = "audit_cycle"

    WALKIN = 1
    PHONE = 2
    WEB = 3
    VISIBILITY = 4
    COMPETITION = 5
    TYPES = (
        (WALKIN, 'walkin'),
        (PHONE, 'phone'),
        (WEB, 'web'),
        (VISIBILITY, 'visibility'),
        (COMPETITION, 'competition'),
    )

    UPCOMING = 1
    ACTIVE = 2
    ARCHIVED = 3
    STATUS = (
        (UPCOMING, 'upcoming'),
        (ACTIVE, 'active'),
        (ARCHIVED, 'archived'),
    )

    id = AutoField(db_column = 'id', primary_key=True)
    type = IntegerField(db_column='type', choices=TYPES, blank=False)
    status = IntegerField(db_column='status', choices=STATUS, blank=False)
    start_date = DateField(db_column='start_date')
    end_date = DateField(db_column='end_date')
    earnings_per_audit = IntegerField(db_column='earnings_per_audit', blank=False)
    description = CharField(db_column='description', max_length=200, blank=False)
    client = ForeignKey('client.Client', related_name='audits', db_column='client_id', on_delete=CASCADE)

#    def audit_count(self):
#        count = 0;
#        for al in self.audits.all():
#            count = count + 1 
#        return count
#
#    def cities(self):
#        cities = [al.location.city for al in self.auditlocations.all()]
#        return set(cities)

    def __str__(self):
        return "AuditCycle({}): client: {}".format(self.id, self.client)


class Audit(Model):
    db_table = "audits"

    id = AutoField(db_column = 'id', primary_key=True)
    store = ForeignKey('client.Store', related_name='audits', db_column='store_id')
    audit_cycle = ForeignKey(AuditCycle, related_name='audits', db_column='audit_cycle_id')

    def __str__(self):
        return "Audit({}): {}, {}".format(self.id, self.store, self.audit_cycle)

    class Meta:
        unique_together = (("store", "audit_cycle"))


class Answer(Model):
    db_table = "answers"

    id = AutoField(db_column = 'id', primary_key=True)
    question = ForeignKey('questionnaire.Question', db_column='question_id', blank=False)
    audit = ForeignKey(Audit, db_column='audit_id', blank=False)

    answer_txt = CharField(db_column='answer_txt', max_length=200, blank=False)
    marks = PositiveIntegerField(db_column='marks', blank=False)

    def __str__(self):
        return "Answer({}): {}, {}".format(self.id, self.answer_txt, self.marks)
