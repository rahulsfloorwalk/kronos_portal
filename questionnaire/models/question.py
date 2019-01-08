from django.db.models import Model, CharField, AutoField, ForeignKey, PositiveIntegerField
from django.db.models import PROTECT
from django.contrib.postgres.fields import JSONField

from kronos.exceptions import AppLogicError
from questionnaire.models.section import Section

class Question(Model):
    PLAIN = "PLAIN"
    MUTEX = "MUTEX"

    QUESTION_TYPE = (
        (PLAIN, "Plain"),
        (MUTEX, "Mutually Exclusive"),
    )

    QUESTION_DATA_V1 = 1

    QUESTION_DATA_VERSIONS = (
        QUESTION_DATA_V1,
    )

    id = AutoField(db_column = 'id', primary_key=True)
    question_txt = CharField(db_column="question_txt", max_length=1024, blank=False)
    max_marks = PositiveIntegerField(db_column='max_marks', blank=False)
    section = ForeignKey(Section, related_name='questions', db_column='section_id', blank=False, on_delete=PROTECT)
    sequence = PositiveIntegerField(db_column='sequence', blank=False)
    question_type = CharField(db_column='question_type', max_length=20, choices=QUESTION_TYPE, default=PLAIN, blank=False)
    question_data = JSONField(db_column='question_data', default=dict, blank=False)

    def clean(self):
        if self.question_type == self.MUTEX:
            data = self.question_data
            if data.get("version") is None or not isinstance(data["version"], int):
                raise AppLogicError("question_data must contain key 'version' of type int")

            if data["version"] is self.QUESTION_DATA_V1:
                if not data.get("options") or not isinstance(data["options"], list):
                    raise AppLogicError("question_data (v{}) must contain key 'options' of type list".format(self.QUESTION_DATA_V1))

                if len(data["options"]) is 0:
                    raise AppLogicError("question_data (v{}) 'options' must have atleast one element".format(self.QUESTION_DATA_V1))

                for option in data["options"]:
                    if not isinstance(option, dict):
                        raise AppLogicError("question_data (v{}) all 'options' should be an instance of dict".format(self.QUESTION_DATA_V1))

                    if not option.get("value") or not isinstance(option["value"], str):
                        raise AppLogicError("question_data (v{}) all 'options' should have key 'value' of type str".format(self.QUESTION_DATA_V1))
                    if option.get("marks") is None or not isinstance(option["marks"], int):
                        raise AppLogicError("question_data (v{}) all 'options' should have key 'marks' of type int".format(self.QUESTION_DATA_V1))
                    if option["marks"] > self.max_marks:
                        raise AppLogicError("marks cannot be greater than max marks")

                    if option.get("sequence") is None or not isinstance(option["sequence"], int):
                        raise AppLogicError("question_data (v{}) all 'options' should have key 'sequence' of type int".format(self.QUESTION_DATA_V1))

    def __str__(self):
        return 'Question({}): {}, {}'.format(self.id, self.question_txt, self.max_marks)

    class Meta:
        ordering = ['sequence']
