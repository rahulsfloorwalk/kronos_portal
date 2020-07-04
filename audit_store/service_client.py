
from kronos.utils import today_ist, get_color_code_by_percentage
from kronos.exceptions import ObjectNotFound
from .models import AuditStore, ReportStatusLog
from answer.service import answer as answer_service
from questionnaire.service import question as question_service


def find_upcoming_for_client(client_id):
    return AuditStore.objects.filter(
        audit__audit_cycle__client_id=client_id,
        status__in=(AuditStore.ASSIGNED, AuditStore.ACKNOWLEDGED),
        audit_date__gte=today_ist(),
    ).order_by('audit_date')


def _get_total_marks_for_questions(questions):
    return sum(question.max_marks for question in questions)


def _get_total_marks_for_answers(answers):
    return sum(answer.marks_obtained for answer in answers)


def find_impact_factors_by_id_for_clientuser(audit_store_id, user):
    impact_factors_arr = []
    audit_store = find_by_id_for_clientuser(audit_store_id, user)
    impact_factors = question_service.find_impact_factors_by_audit_cycle(audit_store.audit.audit_cycle_id)
    for impact_factor in impact_factors:
        questions = question_service.find_by_audit_cycle_id_and_impact_factor(audit_store.audit.audit_cycle_id, impact_factor)
        answers = answer_service.find_by_audit_store_id_and_questions(audit_store.id, questions)
        marks_obtained = _get_total_marks_for_answers(answers)
        total_marks = _get_total_marks_for_questions(questions)
        if total_marks > 0:
            impact_factor_obj = {
                'name': impact_factor,
                'marks_obtained': marks_obtained,
                'total_marks': total_marks,
                'percentage': round(marks_obtained * 100.0 / total_marks),
                'color_code': get_color_code_by_percentage(round(marks_obtained * 100.0 / total_marks))
            }
            impact_factors_arr.append(impact_factor_obj)
    impact_factors_arr.sort(key=lambda x: x['name'])
    return impact_factors_arr


def find_by_id_for_clientuser(audit_store_id, user):
    """
        Normal client user can't access dashboard and report browser that's why need to
        remove visible_to(user) function
    """
    try:
        """
        return AuditStore.objects.presentable().visible_to(user).get(
            audit__audit_cycle__client_id=user.clientuser.client.id,
            id=audit_store_id,
        )
        """
        return AuditStore.objects.presentable().get(
            audit__audit_cycle__client_id=user.clientuser.client.id,
            id=audit_store_id,
        )
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e


def find_presentable_for_client(client_id):
    return AuditStore.objects.presentable().filter(
        audit__audit_cycle__client_id=client_id,
    ).order_by('-audit_date')


def find_visible_to_client_user(user):
    """
    Normal client user can't access dashboard and report browser that's why need to
    remove visible_to(user) function
    """
    # return AuditStore.objects.presentable().visible_to(user)
    return AuditStore.objects.presentable()


def find_today_client_review_status_reports(client_id):
    return ReportStatusLog.objects \
        .filter(audit_store__audit__audit_cycle__client_id=client_id,
                status=AuditStore.COMPLETED, created_at__date=today_ist()) \
        .distinct('audit_store_id')


def find_audit_store_exclude_today(audit_store_id):
    return ReportStatusLog.objects \
        .filter(audit_store_id=audit_store_id, status=AuditStore.COMPLETED) \
        .exclude(created_at__date=today_ist()) \
        .exists()
