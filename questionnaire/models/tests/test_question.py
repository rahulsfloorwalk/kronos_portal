import pytest

from kronos.exceptions import AppLogicError
from questionnaire.models import Question


class TestQuestionModel:

    class TestCleanMethod:
        question_type = Question.PLAIN

        def test_clean_raises_when_question_type_is_unknown(self):
            question = Question(question_type="FOO", question_data={"version": 1})
            with pytest.raises(AppLogicError, match="unknown question_type"):
                question.clean()

        class TestPlainQuestionType:
            question_type = Question.PLAIN

            def test_clean_does_not_raise_when_question_data_is_empty(self):
                question = Question(max_marks=1, question_type=self.question_type, question_data={})
                try:
                    question.clean()
                except AppLogicError:
                    pytest.fail("AppLogicError raised")

            def test_clean_raises_when_question_data_does_not_contain_version(self):
                question = Question(max_marks=1, question_type=self.question_type, question_data={"Foo": "bar"})
                with pytest.raises(AppLogicError, match="unknown version for question_data"):
                    question.clean()

            def test_clean_raises_when_impact_factors_are_repeated(self):
                question_data = {
                    "version": 1,
                    "impact_factors": ["Foo", "Bar", "Foo"],
                }
                question = Question(max_marks=1, question_type=self.question_type, question_data=question_data)
                with pytest.raises(AppLogicError, match="has non-unique elements"):
                    question.clean()

        class TestMutexQuestionType:

            def test_clean_does_not_raise_for_valid_question_data(self):
                question_data = {
                    "version": Question.QUESTION_DATA_V1,
                    "options": [
                        {
                            "sequence": 1,
                            "value": "Yes",
                            "marks": 1,
                        },
                        {
                            "sequence": 2,
                            "value": "No",
                            "marks": 0,
                        },
                    ],
                }
                question = Question(max_marks=1, question_type=Question.MUTEX, question_data=question_data)
                try:
                    question.clean()
                except AppLogicError:
                    pytest.fail("AppLogicError raised")

            def test_clean_raises_when_version_is_missing(self):
                question_data = {
                    "options": [
                        {
                            "sequence": 1,
                            "value": "Yes",
                            "marks": 1,
                        },
                        {
                            "sequence": 2,
                            "value": "No",
                            "marks": 0,
                        },
                    ],
                }
                question = Question(max_marks=1, question_type=Question.MUTEX, question_data=question_data)
                with pytest.raises(AppLogicError, match="unknown version for question_data"):
                    question.clean()

            def test_clean_raises_when_version_is_unknown(self):
                question_data = {
                    "version": 2,
                    "options": [
                        {
                            "sequence": 1,
                            "value": "Yes",
                            "marks": 1,
                        },
                        {
                            "sequence": 2,
                            "value": "No",
                            "marks": 0,
                        },
                    ],
                }
                question = Question(max_marks=1, question_type=Question.MUTEX, question_data=question_data)
                with pytest.raises(AppLogicError, match="unknown version for question_data"):
                    question.clean()

            def test_clean_raises_when_options_key_is_missing(self):
                question_data = {
                    "version": Question.QUESTION_DATA_V1
                }
                question = Question(max_marks=1, question_type=Question.MUTEX, question_data=question_data)
                with pytest.raises(AppLogicError, match="'options' is a required property"):
                    question.clean()

            def test_clean_raises_when_options_is_empty(self):
                question_data = {
                    "version": 1,
                    "options": [],
                }
                question = Question(max_marks=1, question_type=Question.MUTEX, question_data=question_data)
                with pytest.raises(AppLogicError, match=".* is too short"):
                    question.clean()

            def test_clean_raises_when_options_contains_duplicate_sequence(self):
                question_data = {
                    "version": 1,
                    "options": [
                        {
                            "sequence": 1,
                            "value": "Yes",
                            "marks": 1,
                        },
                        {
                            "sequence": 1,
                            "value": "No",
                            "marks": 0,
                        },
                    ],
                }
                question = Question(max_marks=1, question_type=Question.MUTEX, question_data=question_data)
                with pytest.raises(AppLogicError, match="option sequences must be unique"):
                    question.clean()

            def test_clean_raises_when_options_contains_duplicate_values(self):
                question_data = {
                    "version": 1,
                    "options": [
                        {
                            "sequence": 1,
                            "value": "Yes",
                            "marks": 1,
                        },
                        {
                            "sequence": 2,
                            "value": "Yes",
                            "marks": 0,
                        },
                    ],
                }
                question = Question(max_marks=1, question_type=Question.MUTEX, question_data=question_data)
                with pytest.raises(AppLogicError, match="option values must be unique"):
                    question.clean()

            def test_clean_raises_when_option_marks_are_greater_than_max_marks(self):
                question_data = {
                    "version": 1,
                    "options": [
                        {
                            "sequence": 1,
                            "value": "Yes",
                            "marks": 2,
                        },
                        {
                            "sequence": 2,
                            "value": "No",
                            "marks": 1,
                        },
                    ],
                }
                question = Question(max_marks=1, question_type=Question.MUTEX, question_data=question_data)
                with pytest.raises(AppLogicError, match="option marks cannot be greater than max marks"):
                    question.clean()

            def test_clean_raises_when_impact_factors_are_repeated(self):
                question_data = {
                    "version": 1,
                    "options": [
                        {
                            "sequence": 1,
                            "value": "Yes",
                            "marks": 2,
                        },
                        {
                            "sequence": 2,
                            "value": "No",
                            "marks": 1,
                        },
                    ],
                    "impact_factors": ["Foo", "Bar", "Foo"],
                }
                question = Question(max_marks=1, question_type=self.question_type, question_data=question_data)
                with pytest.raises(AppLogicError, match="has non-unique elements"):
                    question.clean()
