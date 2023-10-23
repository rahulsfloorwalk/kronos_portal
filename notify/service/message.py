import requests
import json
from django.conf import settings
from monitoring.service import whatsapp_log_service

import messagebird
from messagebird.conversation_message import MESSAGE_TYPE_HSM

MSG91 = settings.MSG91

MSG91_URL = MSG91['MSG91_URL']
MSG91_AUTH_KEY = MSG91['MSG91_AUTH_KEY']
MSG91_SENDER_ID = MSG91['MSG91_SENDER_ID']


def send_message(flow_id, recipients_with_params):
    payload = json.dumps({
        "flow_id": flow_id,
        "sender": MSG91_SENDER_ID,
        "recipients": recipients_with_params
    })

    headers = {
        'authkey': MSG91_AUTH_KEY,
        'content-type': "application/json"
    }

    req = requests.post(MSG91_URL, data=payload, headers=headers)
    return req.json()


def send_whatsapp_message(whatsapp_no: str, dial_code: str, template_name: str, params: list):
    client = messagebird.Client(settings.MESSAGEBIRD_ACCESS_KEY)
    try:
        if len(params)==4 and params[3]['pdf_url']:
            msg = client.conversation_start({
                "channelId": settings.MESSAGEBIRD_CHANNEL_ID,
                "to": "{}{}".format(dial_code,whatsapp_no),
                "type": MESSAGE_TYPE_HSM,
                "content": 
                {
                "hsm": {
                    "namespace": settings.MESSAGEBIRD_NAMESPACE,
                    "templateName": template_name,
                    "language": {
                        "policy": "deterministic",
                        "code": "en"
                    },
                "components": 
                    [
                    {
                    "type": "header",
                    "parameters": 
                        [
                        {
                        "type": "document",
                        "document": {
                            "url": params[3]['pdf_url']
                        }
                        }
                        ]
                    },
                    {
                    "type": "body",
                    "parameters": 
                        [
                        {
                        "type": "text",
                        "text": params[0]['default']
                        },
                        {
                        "type": "text",
                        "text": params[1]['default']
                        },
                        {
                        "type": "text",
                        "text": params[2]['default']
                        }
                        ]
                    }
                    ]
                }
                } 
  
            })    
        
        else:
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