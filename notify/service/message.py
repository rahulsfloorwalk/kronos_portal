import requests
import json
from django.conf import settings
from monitoring.service import message_log_service
from monitoring.service import whatsapp_log_service

import messagebird
from messagebird.conversation_message import MESSAGE_TYPE_HSM

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


def send_whatsapp_message(whatsapp_no: str, dial_code: str, template_name: str, params: list):
    client = messagebird.Client(settings.MESSAGEBIRD_ACCESS_KEY)
    try:
        msg = client.conversation_start({
            "channelId": settings.MESSAGEBIRD_CHANNEL_ID,
            "to": "{}{}".format(dial_code,whatsapp_no),
            "type": MESSAGE_TYPE_HSM,
            "content":{
                "hsm":{
                    "namespace": settings.MESSAGEBIRD_NAMESPACE,
                    "templateName": template_name,
                    "language": {
                        "policy": "deterministic",
                        "code": "en",
                    },
                    "params": params
                }
            }
        })
        return whatsapp_log_service.log_message(whatsapp_no, msg.id, msg.messages.lastMessageId)
    except messagebird.client.ErrorException as e:
        pass
    return False