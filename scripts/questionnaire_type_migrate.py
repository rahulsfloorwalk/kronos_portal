from django.db.transaction import atomic
from audit.models import AuditCycle
from questionnaire.models import QuestionnaireType

@atomic
def generate_questionnaire_types():
    created_count = 0
    for audit_cycle in AuditCycle.objects.all():
        name = audit_cycle.get_type_display()
        questionnaire_type = QuestionnaireType.objects.filter(name=name, client_id=audit_cycle.client_id).first()
        if questionnaire_type:
            audit_cycle.questionnaire_type = questionnaire_type
            audit_cycle.save()
        else:
            QuestionnaireType.objects.create(name=name, client_id=audit_cycle.client_id)
            print("created {} for {}".format(name, audit_cycle.client.name))
            created_count = created_count + 1
    print("Created {} new Questionnaire Types".format(created_count))
