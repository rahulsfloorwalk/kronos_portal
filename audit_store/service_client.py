import xlsxwriter
import io
import logging
from django.conf import settings
from django.template.loader import render_to_string
from notify.service.mail import send_email
from django.template.loader import get_template
from kronos.utils import today_ist, get_color_code_by_percentage, get_color_code, get_color_hex_from_code
from kronos.exceptions import ObjectNotFound
from .models import AuditStore, ReportStatusLog, ReportActionPlan,AuditCycle
from answer.service import answer as answer_service
from questionnaire.service import question as question_service
from client.service.client_user import find_non_client_admin_user_store_by_client_user_id
from audit.service.audit_cycle import find_by_id
from notify.service.mail_audit_report import audit_feedback_report_mail_task
from registration.context import registration_context
from django.core.mail import EmailMessage
from datetime import timedelta
_logger = logging.getLogger(__name__)

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
        .exclude(created_at__date= today_ist()) \
        .exists()

def find_yesterday_client_review_status_reports(client_id):
    return ReportStatusLog.objects \
        .filter(audit_store__audit__audit_cycle__client_id=client_id,
                status=AuditStore.COMPLETED, created_at__date=today_ist()-timedelta(days=1)) \
        .distinct('audit_store_id')

def find_audit_store_completed_yesterday(audit_store_id):
    return ReportStatusLog.objects \
        .filter(audit_store_id=audit_store_id, status=AuditStore.COMPLETED) \
        .exclude(created_at__date= today_ist()-timedelta(days=1)) \
        .exists()


def get_reports_action_plan(client_user, audit_cycle_id):
    if client_user.is_client_admin():
        report_action = ReportActionPlan.objects\
            .filter(audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                    audit_store__audit__audit_cycle__id=audit_cycle_id)\
            .order_by('status', 'target_date')
    else:
        non_admin_user_store = find_non_client_admin_user_store_by_client_user_id(client_user.id)
        non_admin_user_store_list = non_admin_user_store.get_store_list()
        report_action = ReportActionPlan.objects\
            .filter(audit_store__audit__store__id__in=non_admin_user_store_list,
                    audit_store__status__in=[AuditStore.COMPLETED, AuditStore.ACCEPTED],
                    audit_store__audit__audit_cycle__id=audit_cycle_id)\
            .order_by('status', 'target_date')
    return report_action


def change_status_report_action(action_plan_id):
    report_action_plan = ReportActionPlan.objects.get(pk=action_plan_id)
    report_action_plan.status = ReportActionPlan.TAKEN
    report_action_plan.save()
    return report_action_plan


def get_audit_store_action_plan(audit_store_id):
    audit_store_action_plan = ReportActionPlan.objects.filter(audit_store__id=audit_store_id).order_by('status')
    return audit_store_action_plan

def send_mail_for_report_action_plan(person,params,audit_cycle_name):
    subject = 'Action Plan For {} | FloorWalk'.format(audit_cycle_name)  
    message = get_template('audit_store/report_action_plan.html').render({
        'audit_store_id':params['audit_store_id'],
        'email':person,
        'action_plan':params['action_plan'],
        'target_date':params['target_date'],
        'store_name': params['store_name'],
        'store_address': params['store_address'],
        'store_city': params['store_city'],
        'client_name': params['client_name'],
        'admin_name': params['admin_name'], 
        **registration_context(),
    })
    msg = EmailMessage(subject, message, to=(person,))
    msg.content_subtype = 'html'
    if settings.EMAIL_SWITCH['REPORT_ACTION']:
        msg.send()
        _logger.info("report action email sent to user : %s", person)
    else:
        _logger.info("report action email disabled. skipping email for user : %s", person)
        _logger.debug("DUMPING REPORT ACTION EMAIL : %s", message)

def submit_audit_store_action_plan(admin_name,audit_store_id, client_user, action_plan, target_date, person):
    audit_store = AuditStore.objects.get(pk=audit_store_id)
    report_action_obj = ReportActionPlan()
    report_action_obj.audit_store = audit_store
    report_action_obj.action_plan_description = action_plan
    report_action_obj.person_responsible = person
    report_action_obj.created_by = client_user.full_name
    report_action_obj.target_date = target_date
    report_action_obj.status = ReportActionPlan.PENDING
    report_action_obj.save()
    params= {
        'audit_store_id':audit_store_id,
        'email':person,
        'action_plan':action_plan,
        'target_date':target_date,
        'store_name': audit_store.audit.store.name,
        'store_address': audit_store.audit.store.address,
        'store_city': audit_store.audit.store.city.name,
        'client_name': audit_store.audit.audit_cycle.client.name,
        'admin_name': admin_name
    }
    send_mail_for_report_action_plan(person,params,audit_store.audit.audit_cycle.name)
    return report_action_obj


def get_reports_action_plan_xlsx(client_user, audit_cycle_id):
    audit_cycle = find_by_id(audit_cycle_id)
    report_action_data = get_reports_action_plan(client_user, audit_cycle_id)
    data = create_text_structure(report_action_data, audit_cycle.name)
    name = (str(audit_cycle.name) + " Action Report Plan List" + ".xlsx").replace("-", "")
    return write_data(data), name


def create_text_structure(report_action_data, audit_cycle_name):
    rows = []

    # generate title row
    row = {'type': 'title', 'content': [str(audit_cycle_name) + ' Action Report Plan List']}
    rows.append(row)

    # generate header of improvable questions
    cells = [{'value': "Report ID"}, {'value': "Person Responsible"}, {'value': "Target Date"}, {'value': "Store"},
             {'value': "Action Plan"}, {'value': "Status"}, {'value': "Created By"}, {'value': "Report URL"}]
    row = {'type': 'header', 'content': cells}
    rows.append(row)

    # generate improvable question rows
    for action in report_action_data:
        audit_store_id = {
            'value': action.audit_store_id,
            'color_code': get_color_code(0, 0)
        }
        person_responsible = {
            'value': action.person_responsible,
            'color_code': get_color_code(0, 0)
        }
        target_date = {
            'value': str(action.target_date),
            'color_code': get_color_code(0, 0)
        }
        store = {
            'value': str(action.store_details()),
            'color_code': get_color_code(0, 0)
        }
        action_plan_description = {
            'value': action.action_plan_description,
            'color_code': get_color_code(0, 0)
        }
        action_status = "Action Pending" if action.status == ReportActionPlan.PENDING else "Action Taken"
        color_value = 1 if action_status == "Action Pending" else 100
        status = {
            'value': action_status,
            'color_code': get_color_code(color_value, 100)
        }
        created_by = {
            'value': action.created_by,
            'color_code': get_color_code(0, 0)
        }
        audit_report_url = settings.KRONOS_BASE_URL + "/auth/client/login?next=/static/client/index.html%23/audit_store/" + str(action.audit_store_id)
        url = {
            'value': "Click Here",
            'url': audit_report_url,
            'color_code': get_color_code(0, 0)
        }
        content = [audit_store_id, person_responsible, target_date, store, action_plan_description, status, created_by, url]
        row = {
            'type': 'action_data',
            'content': content
        }
        rows.append(row)
    return rows


def write_data(data):
    title_color = '#FFFFFF'
    question_color = '#BEBEBE'
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()
    section_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'top': 1,
        'bottom': 1,
        'right': 1,
        'bg_color': question_color,
        'font_color': 'black',
        'valign': 'vcenter',
        'font_size': 14,
    })

    title_format = workbook.add_format({
        'text_wrap': True,
        'bold': True,
        'font_size': 16,
        'bottom': 1,
        'bg_color': title_color,
        'font_color': 'black',
        'valign': 'vcenter',
    })

    base_answer_style = {
        'text_wrap': True,
        'bottom': 1,
        'right': 1,
        'valign': 'vcenter',
    }


    def get_format_for_color_code(wb, base_style_dict, color_code):
        colored_style = base_style_dict.copy()
        colored_style['bg_color'] = get_color_hex_from_code(color_code)
        return wb.add_format(colored_style)

    start_row = 0
    start_col = 0
    # worksheet.set_column(0, 512, 15)
    worksheet.set_column(0, 0, 10)
    worksheet.set_column(1, 1, 20)
    worksheet.set_column(2, 2, 15)
    worksheet.set_column(3, 3, 15)
    worksheet.set_column(4, 4, 80)
    worksheet.set_column(5, 5, 15)
    worksheet.set_column(6, 6, 15)
    worksheet.set_column(7, 7, 15)
    worksheet.set_default_row(40)
    row = start_row
    col = start_col

    line_counter = 0
    for line in data:
        if line.get('type') == 'title':
            for point in line.get('content'):
                worksheet.merge_range(row, col, row, col + 6, point, title_format)
                col += 1
        elif line.get('type') == 'header':
            for cell in line.get('content'):
                if isinstance(cell, dict):
                    if cell.get('colspan', 1) > 1:
                        worksheet.merge_range(row, col, row, col + cell.get('colspan') - 1, cell.get('value'),
                                              section_format)
                        col += cell.get('colspan', 1)
                    else:
                        worksheet.write(row, col, cell.get('value', ""), section_format)
                        col += 1
                else:
                    worksheet.write(row, col, cell, section_format)
                    col += 1
        elif line.get('type') == 'action_data':
            for cell in line.get('content'):
                if 'url' in cell:
                    worksheet.write_url(row, col, cell.get('url'), string=cell.get('value'))
                else:
                    worksheet.write(row, col, cell.get('value'),
                                    get_format_for_color_code(workbook, base_answer_style, cell.get('color_code', 0)))
                col += 1
            line_counter = ~line_counter
        col = start_col
        row += 1

    workbook.close()
    output.seek(0)
    return output


def audit_feedback_report_mail(email_list, audit_store_id, audit_report, user):
    context = {
        'audit_report': audit_report
    }
    rendered_report_data = render_to_string('notify/audit_feedback_report.html', context)
    audit_store = find_by_id_for_clientuser(audit_store_id, user)
    data = {
        "brand_name": user.clientuser.client.brand_name,
        "audit_cycle_name": audit_store.audit.audit_cycle.name,
        "audit_cycle_month": audit_store.audit_date.strftime("%B"),
        "store_name": audit_store.audit.store.name,
        "city": audit_store.audit.store.city.name,
        "audit_date": audit_store.audit_date.strftime("%d %b %Y"),
    }

    audit_feedback_report_mail_task.delay(email_list, rendered_report_data, data)
    return audit_store