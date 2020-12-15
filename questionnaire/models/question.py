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
    MULTISELECT = "MULTISELECT"

    QUESTION_TYPE = (
        (PLAIN, "Plain"),
        (MUTEX, "Mutually Exclusive"),
        (MULTISELECT, "Multiple Select"),
    )

    QUESTION_DATA_V1 = 1

    QUESTION_DATA_VERSIONS = (
        QUESTION_DATA_V1,
    )

    IMPACT_FACTORS_SCHEMA = {
        "type": "array",
        "uniqueItems": True,
        "items": {
            "minLength": 1,
            "type": "string",
        },
    }

    QUESTION_DATA_PLAIN_SCHEMA_V1 = {
        "type": "object",
        "required": ["version"],
        "properties": {
            "version": {
                "type": "integer",
            },
            "impact_factors": IMPACT_FACTORS_SCHEMA,
        },
    }

    QUESTION_DATA_MUTEX_SCHEMA_V1 = {
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
            "impact_factors": IMPACT_FACTORS_SCHEMA,
        },
    }

    id = AutoField(db_column = 'id', primary_key=True)
    question_txt = CharField(db_column="question_txt", max_length=1024, blank=False)
    max_marks = PositiveIntegerField(db_column='max_marks', blank=False)
    section = ForeignKey(Section, related_name='questions', db_column='section_id', blank=False, on_delete=PROTECT)
    sequence = PositiveIntegerField(db_column='sequence', blank=False)
    question_type = CharField(db_column='question_type', max_length=20, choices=QUESTION_TYPE, default=PLAIN, blank=False)
    question_data = JSONField(db_column='question_data', default=dict, blank=False)

    def __has_unique_key(self, a_list_of_dicts, unique_key):
        values = [d[unique_key] for d in a_list_of_dicts]
        return len(values) == len(set(values))

    def __validate_v1_data(self):

        data = self.question_data

        if self.question_type == self.PLAIN:
            if self.question_data != {}:
                try:
                    validate(self.question_data, self.QUESTION_DATA_PLAIN_SCHEMA_V1)
                except ValidationError as v:
                    raise AppLogicError(v.message) from v
        elif self.question_type == self.MUTEX:
            try:
                validate(self.question_data, self.QUESTION_DATA_MUTEX_SCHEMA_V1)
            except ValidationError as v:
                raise AppLogicError(v.message) from v

            # check for unique sequences
            for option in data["options"]:
                if option["marks"] > self.max_marks:
                    raise AppLogicError("option marks cannot be greater than max marks")

            # check for unique sequences
            if not self.__has_unique_key(data["options"], "sequence"):
                raise AppLogicError("option sequences must be unique")

            # check for unique values
            if not self.__has_unique_key(data["options"], "value"):
                raise AppLogicError("option values must be unique")
        elif self.question_type == self.MULTISELECT:
            try:
                validate(self.question_data, self.QUESTION_DATA_MUTEX_SCHEMA_V1)
            except ValidationError as v:
                raise AppLogicError(v.message) from v

            # check for max marks and option marks
            option_marks = 0
            for option in data["options"]:
                option_marks = option_marks + option["marks"]
            if option_marks != self.max_marks:
                raise AppLogicError("addition of option marks should be equal to max marks")

            # check for unique sequences
            if not self.__has_unique_key(data["options"], "sequence"):
                raise AppLogicError("option sequences must be unique")

            # check for unique values
            if not self.__has_unique_key(data["options"], "value"):
                raise AppLogicError("option values must be unique")
        else:
            raise AppLogicError("unknown question_type")

    def __question_data_version(self):
        version = self.question_data.get("version") in self.QUESTION_DATA_VERSIONS
        if self.question_type == Question.PLAIN:
            if self.question_data == {}:
                return self.QUESTION_DATA_V1
            else:
                return version
        else:
            return version

    def clean(self):
        question_data_version = self.__question_data_version()
        if question_data_version == self.QUESTION_DATA_V1:
            self.__validate_v1_data()
        else:
            raise AppLogicError("unknown version for question_data")

    def __str__(self):
        return 'Question({}): {}, {}'.format(self.id, self.question_txt, self.max_marks)

    class Meta:
        ordering = ['sequence']
