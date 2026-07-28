from manager.service import audit as audit_service
from django.db.models import Prefetch
from questionnaire.models import Question

def get_audit_cycle_comparison(client_id, audit_cycle_type):
    data = {}
    section_names = []
    section_max_marks = []
    rows = []

    audit_cycle = audit_service.get_latest_audit_cycle_for_client(client_id, audit_cycle_type)
    audits = audit_cycle.audits.all()
    # sections = audit_cycle.sections.order_by("sequence").all()

    sections = audit_cycle.sections.filter(
        questions__visibility=Question.VISIBLE_TO_ALL,questions__hide_question=False).distinct().order_by("sequence").prefetch_related(
        Prefetch('questions', queryset=Question.objects.filter(visibility=Question.VISIBLE_TO_ALL,hide_question=False))
    )
    for audit in audits:
        store = audit.store
        audit_stores = audit.audit_stores.presentable().order_by("-audit_date")
        for audit_store in audit_stores:
            row = []
            row.append(audit_store.id)
            row.append(store.name)
            row.append(store.city.name)
            row.append(audit_store.audit_date)
            report_sections = audit_store.report_sections.order_by("section__sequence").all()
            for report_section in report_sections:
                # if report_section.section.max_marks() != 0:
                #     row.append(report_section.marks_obtained())
                section_max_marks_value = sum(
                    q.max_marks for q in report_section.section.questions.all()
                )
                if section_max_marks_value != 0:
                    row.append(report_section.marks_obtained())
            row.append(audit_store.percentage())
            rows.append(row)

    section_names.append("Store")
    section_names.append("City")
    section_names.append("Audit Date")
    section_max_marks.append("")
    section_max_marks.append("")
    section_max_marks.append("Max Marks:")
    for section in sections:
        # if section.max_marks() != 0:
            # section_names.append(section.name)
            # section_max_marks.append(section.max_marks())
        max_marks = sum(
            q.max_marks for q in section.questions.all()
        )
        if max_marks != 0:
            section_names.append(section.name)
            section_max_marks.append(max_marks)
    section_names.append("Percentage")
    section_max_marks.append("100%")

    data['headings'] = section_names
    data['section_max_marks'] = section_max_marks
    data['type'] = audit_cycle.type
    data['rows'] = rows
    return data
