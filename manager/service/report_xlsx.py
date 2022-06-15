import io
from collections import defaultdict
import xlsxwriter

from manager.service.reports import get_project_cost_report


def generate_project_cost_report_xlsx(month: int, year: int, client: int):
    report_data = get_project_cost_report(month, year, client)
    name = "Project cost report.xlsx"
    data = create_text_structure(report_data)
    return write_data(data), name


def create_text_structure(report_data: list) -> list:
    structure_data = [{
        'type': 'header',
        'data': ['Client', 'Cycle', 'Month', 'year', 'Planned Audits', 'Conducted Audits', '% Completion', 'Budget Utilized', 'Estimated Cost', 'Actual Cost', 'Variation']
    }]

    data_list = []
    total_count_row = defaultdict(lambda:0)

    for data in report_data:
        data_list.append([
            data['client'],
            data['name'],
            data['month'],
            data['year'],
            data['planned_audit'],
            data['conducted_audit'],
            data['audit_complete_per'],
            data['budget_utilized'],
            data['estimated_cost'],
            data['actual_cost'],
            data['variation'],
        ])

        total_count_row['planned_audit'] += data['planned_audit']
        total_count_row['conducted_audit'] += data['conducted_audit']
        total_count_row['audit_complete_per'] += data['audit_complete_per']
        total_count_row['budget_utilized'] += data['budget_utilized']
        total_count_row['estimated_cost'] += data['estimated_cost']
        total_count_row['actual_cost'] += data['actual_cost']
        total_count_row['variation'] += data['variation']

    structure_data.append({
        'type': 'record',
        'data': data_list,
    })

    if len(report_data) == 0:
        total_count_row['audit_complete_per'] = 0
    else:
        total_count_row['audit_complete_per'] = round(total_count_row['audit_complete_per'] / len(report_data), 1)

    total_row = [total_count_row['planned_audit'], total_count_row['conducted_audit'], total_count_row['audit_complete_per'], total_count_row['budget_utilized'], total_count_row['estimated_cost'], total_count_row['actual_cost'], total_count_row['variation']]
    structure_data.append({
        'type': 'total',
        'data': total_row,
    })
    return structure_data


def write_data(data):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet()

    row = 0
    col = 0

    cell_bold_format = workbook.add_format()
    cell_bold_format.set_bold()

    merge_format = workbook.add_format({
        'font_color': 'black',
        'valign': 'vcenter',
        'align': 'center',
        'bold': True
    })

    # Iterate over the data and write it out row by row.
    for item in (data):
        col = 0
        if item['type'] == 'header':
            for i in item['data']:
                worksheet.write(row, col, i, cell_bold_format)
                col += 1
            row += 1
        elif item['type'] == 'total':
            worksheet.merge_range(row, col, row, col + 3, 'Total', merge_format)
            # worksheet.merge_range('A{}:D{}'.format(row, row), 'Total')
            for i in item['data']:
                worksheet.write(row, col + 4, i, cell_bold_format)
                col += 1
            row += 1
        elif item['type'] == 'record':
            for li in item['data']:
                col = 0
                for j in li:
                    worksheet.write(row, col, j)
                    col += 1
                row += 1

    workbook.close()
    output.seek(0)
    return output