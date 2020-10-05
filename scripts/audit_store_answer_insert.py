import csv
import requests
import pprint

# filename = "scripts/answer_csv_file.csv"
# from scripts.audit_store_answer_insert import start_script
# start_script(filename)
# start_script(filename, "https://portal.floorwalk.in")


def get_answer_list(filename):
    answer_list = []
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            answer_dict = {}
            answer_dict['question_id'] = row['question_id']
            answer_dict['audit_store_id'] = row['audit_store_id']
            answer_dict['answer_text'] = row['answer_text']
            answer_list.append(answer_dict)

    return answer_list


def post_answer_data(base_url, answer_list):
    manager_login_url = base_url + "/auth/manager/login"
    post_answer_url = base_url + "/manager/audit_store"

    http_client = requests.session()
    # Retrieve the CSRF token first
    http_client.post(manager_login_url, {'username': 'ankush.take@floorwalk.in', 'password': 'ankushfw123#'})
    # http_client.post(manager_login_url, {'username': 'ankush_manager@gmail.com', 'password': '12345678'})

    for answer in answer_list:
        http_client.post(manager_login_url, {'username': 'ankush.take@floorwalk.in', 'password': 'ankushfw123#'})
        # http_client.post(manager_login_url, {'username': 'ankush_manager@gmail.com', 'password': '12345678'})

        post_answer_url_new = post_answer_url + "/"+str(answer['audit_store_id'])+"/question/"+str(answer['question_id'])+"/answer_text"
        answer_data = {"answer_text": answer['answer_text']}
        answer_response = http_client.post(post_answer_url_new, data=answer_data)
        pprint.pprint(answer_response.json())


def start_script(filename, base_url="http://localhost:8000"):
    answer_list = get_answer_list(filename)
    post_answer_data(base_url, answer_list)
