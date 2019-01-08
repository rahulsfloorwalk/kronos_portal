from django.db.models import Model, CharField, AutoField, ForeignKey, PositiveIntegerField
from django.db.models import PROTECT
from django.contrib.postgres.fields import JSONField

from jsonschema import validate
from jsonschema.exceptions import ValidationError

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

    QUESTION_DATA_SCHEMA_V1 = {
        "type": "object",
        "required": ["version", "options"],
        "properties": {
            "version": {
                "type": "integer",
            },
            "options": {
                "type": "array",
                "uniqueItems": True,
                "minItems": 1,
                "items": {
                    "type": "object",
                    "required": ["sequence", "value", "marks"],
                    "properties": {
                        "sequence": {
                            "type": "integer",
                        },
                        "value": {
                            "minLength": 1,
                            "type": "string",
                        },
                        "marks": {
                            "type": "integer",
                        },
                    },
                }
            },
        },
    }

    id = AutoField(db_column = 'id', primary_key=True)
    question_txt = CharField(db_column="question_txt", max_length=1024, blank=False)
    max_marks = PositiveIntegerField(db_column='max_marks', blank=False)
    section = ForeignKey(Section, related_name='questions', db_column='section_id', blank=False, on_delete=PROTECT)
    sequence = PositiveIntegerField(db_column='sequence', blank=False)
    question_type = CharField(db_column='question_type', max_length=20, choices=QUESTION_TYPE, default=PLAIN, blank=False)
    question_data = JSONField(db_column='question_data', default=dict, blank=False)

    def __validate_mutex_data(self):
        def _has_unique_key(a_list_of_dicts, unique_key):
            values = [d[unique_key] for d in a_list_of_dicts]
            return len(values) is len(set(values))

        data = self.question_data
        if data.get("version") is self.QUESTION_DATA_V1:
            try:
                validate(self.question_data, self.QUESTION_DATA_SCHEMA_V1)
            except ValidationError as v:
                raise AppLogicError(v.message) from v

            # check for unique sequences
            for option in data["options"]:
                if option["marks"] > self.max_marks:
                    raise AppLogicError("option marks cannot be greater than max marks")

            # check for unique sequences
            if not _has_unique_key(data["options"], "sequence"):
                raise AppLogicError("option sequences must be unique")

            # check for unique values
            if not _has_unique_key(data["options"], "value"):
                raise AppLogicError("option values must be unique")
        else:
            raise AppLogicError("unknown version for question_data")

    def __validate_plain_data(self):
        if self.question_data != {}:
            raise AppLogicError("question_data must be empty")

    def clean(self):
        if self.question_type == self.PLAIN:
            self.__validate_plain_data()
        elif self.question_type == self.MUTEX:
            self.__validate_mutex_data()
        else:
            raise AppLogicError("unknown question_type")

    def __str__(self):
        return 'Question({}): {}, {}'.format(self.id, self.question_txt, self.max_marks)

    class Meta:
        ordering = ['sequence']
