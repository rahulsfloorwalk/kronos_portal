import xlsxwriter
import io

from client.models import Client, ClientUser
from audit.models import AuditCycle
from client.models import Store
from audit_store.models import AuditStore

from kronos.utils import get_color_code, get_color_hex_from_code


def generate_all_stores_audit_cycle_wise_report_for_clientuser(client_user_id, year):
    client_id = ClientUser.objects.get(user__id=client_user_id).client.id
    client_name, audit_cycle_list, store_list, audit_store_list = get_aggregate_data(client_id, year)
    data = create_text_structure(client_name, audit_cycle_list, store_list, audit_store_list)
    name = (str(client_name) + " audit cycle wise report " + "year(" + str(year) + ")" + ".xlsx").replace("-", "")
    return write_data(data), name


def get_aggregate_data(client_id, year):
    client_name = Client.objects.get(id=client_id).brand_name
    audit_cycle_list = AuditCycle.objects \
        .filter(client_id=client_id, status__in=[AuditCycle.ARCHIVED, AuditCycle.CLEARING], start_date__year=year) \
        .order_by('start_date')
    store_list = Store.objects.filter(client_id=client_id)
    audit_store_list = []
    audit_store_data = AuditStore.objects \
        .filter(audit__store__client__id=client_id, audit__audit_cycle__status__in=[AuditCycle.ARCHIVED, AuditCycle.CLEARING]) \
        .filter(audit__audit_cycle__start_date__year=year) \
        .presentable() \
        .prefetch_related(
            'answers',
            'report_sections'
        )
    for i in audit_store_data.iterator():
        audit_store_list.append({'audit_cycle_id': i.audit.audit_cycle.id, 'store_id': i.audit.store.id, 'percentage': i.percentage()})
    return client_name, audit_cycle_list, store_list, audit_store_list


def create_text_structure(client_name, audit_cycle_list, store_list, audit_store_list):
    rows = []

    # generate title row
    row = {'type': 'title', 'content': [client_name]}
    rows.append(row)

    # generate audit cycle row
    audit_cycle = []
    for audit_cycle_d in audit_cycle_list:
        audit_cycle.append({
            'value': audit_cycle_d.name,
        })
    cells = [{'value': "Store Code"}, {'value': "Store Name"}] + audit_cycle
    row = {'type': 'audit_cycle', 'content': cells}
    rows.append(row)

    # generate report section rows
    for store in store_list:
        store_code_cell = {
            'value': store.code,
            'color_code': get_color_code(0, 0)
        }
        store_name_cell = {
            'value': store.name + " - " + store.city.name,
            'color_code': get_color_code(0, 0)
        }

        report_section_cells = []
        for audit_cycle in audit_cycle_list:
            # if AuditStore.objects \
            #         .filter(audit__audit_cycle__id=audit_cycle.id, audit__store__id=store.id) \
            #         .presentable():
            # if {'audit__audit_cycle__id': audit_cycle.id, 'audit__store__id': store.id} in audit_store_list:
            result = [sub for sub in audit_store_list if sub['audit_cycle_id'] == audit_cycle.id and sub['store_id'] == store.id]
            if result:
                mean_count = 0
                per = 0
                # for audit_report in AuditStore.objects \
                #         .filter(audit__audit_cycle__id=audit_cycle.id, audit__store__id=store.id) \
                #         .presentable():
                for res in result:
                    mean_count += 1
                    per = per + round(res['percentage'])
                percent = round(per / mean_count)
                report_section_cells.append({
                    'value': str(percent) + "%",
                    'color_code': get_color_code(percent, 100)
                })
            else:
                report_section_cells.append(
                    {
                        'value': "NA",
                        'color_code': get_color_code(0, 0)
                    })
        content = [store_code_cell, store_name_cell] + report_section_cells
        row = {
            'type': 'report_section',
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
    worksheet.set_column(0, 512, 15)
    worksheet.set_default_row(40)
    row = start_row
    col = start_col

    line_counter = 0
    for line in data:
        if line.get('type') == 'title':
            for point in line.get('content'):
                worksheet.merge_range(row, col, row, col + 2, point, title_format)
                col += 1
        elif line.get('type') == 'audit_cycle':
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
        elif line.get('type') == 'report_section':
            for cell in line.get('content'):
                worksheet.write(row, col, cell.get('value'),
                                get_format_for_color_code(workbook, base_answer_style, cell.get('color_code', 0)))
                col += 1
            line_counter = ~line_counter
        col = start_col
        row += 1

    workbook.close()
    output.seek(0)
    return output