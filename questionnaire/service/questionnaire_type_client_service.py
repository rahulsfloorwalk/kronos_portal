from questionnaire.models import QuestionnaireType

def find_questionnaire_types_by_client_id(client_id):
    return QuestionnaireType.objects.filter(client_id=client_id)

