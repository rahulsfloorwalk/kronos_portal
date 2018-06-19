from questionnaire.models import QuestionnaireType

def find_questionnaire_types_for_client_by_user(user):
    return QuestionnaireType.objects.filter(client_id=user.clientuser.client_id)

