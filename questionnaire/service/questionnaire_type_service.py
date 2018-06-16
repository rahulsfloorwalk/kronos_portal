from django.db import IntegrityError

from kronos.exceptions import ObjectNotFound, AppLogicError

from questionnaire.models import QuestionnaireType

def find_questionnaire_type_by_id(questionnaire_type_id):
    try:
        return QuestionnaireType.objects.get(pk=questionnaire_type_id)
    except QuestionnaireType.DoesNotExist as e:
        raise ObjectNotFound from e

def delete_questionnaire_type_by_id(questionnaire_type_id):
    try:
        s = find_questionnaire_type_by_id(questionnaire_type_id)
        s.delete()
    except IntegrityError as e:
        raise AppLogicError("Questionnaire Type is in use") from e

