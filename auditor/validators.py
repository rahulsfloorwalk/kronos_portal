from django.core.validators import RegexValidator, MinLengthValidator

import strings

numericValidator = RegexValidator(r'^[0-9]*$', strings.NUMERIC_REGEX_VALIDATION_ERROR)
minLengthValidator = MinLengthValidator(10, strings.MIN_LENGTH_REGEX_VALIDATION_ERROR)