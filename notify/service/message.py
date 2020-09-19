import requests
import json
from django.conf import settings
from monitoring.service import message_log_service

MSG91 = settings.MSG91

MSG91_URL = MSG91['MSG91_URL']
MSG91_FLOW_ID = MSG91['MSG91_FLOW_ID']
MSG91_AUTH_KEY = MSG91['MSG91_AUTH_KEY']
MSG91_SENDER_ID = MSG91['MSG91_SENDER_ID']


def send_message(first_name, mobile_number):
    mobile_number_with_code = "91" + str(mobile_number)
    payload = json.dumps({
        "flow_id": MSG91_FLOW_ID,
        "sender": MSG91_SENDER_ID,
        "recipients": [
            {
                "mobiles": mobile_number_with_code,
                "name": first_name
            }
        ]
    })

    headers = {
        'authkey': MSG91_AUTH_KEY,
        'content-type': "application/json"
    }

    req = requests.post(MSG91_URL, data=payload, headers=headers)
    response = req.json()
    msg_status = "pending"
    if 'type' in response:
        msg_status = response['type']
    return message_log_service.log_message(str(mobile_number), msg_status)
