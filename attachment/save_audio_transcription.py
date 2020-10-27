import os
import logging

from datetime import date
from django.conf import settings
from kronos.celery import app

from kronos.utils import get_language_code_by_country_code

from attachment.service import get_audit_store_for_attachment

from attachment.models import Attachment

from google.oauth2 import service_account
from google.cloud import speech_v1p1beta1

import urllib.request

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def save_audio_transcription():
    if settings.AUDIO_TRANSCRIPTION:
        attachment_obj = Attachment.objects.filter(completed_at__date=date.today(), proof_type__in=["AUDIO", "OTHER"],
                                                   status="ATTACHED")
        for attachment in attachment_obj:
            transcript_data = attachment.audio_transcript_data
            if "transcript_list" not in transcript_data:
                audit_store = get_audit_store_for_attachment(attachment.id)
                country_code = audit_store.audit.store.city.country
                if attachment.proof_type == Attachment.OTHER:
                    file_slug = attachment.file_slug
                    file_extension = (file_slug.split(".")[-1]).lower() if "." in file_slug else ""
                    if file_extension == 'amr':
                        _logger.info("looking for audio transcription of attachment %s", attachment.id)
                        save_transcription.delay(attachment, country_code)
                else:
                    _logger.info("looking for audio transcription of attachment %s", attachment.id)
                    save_transcription.delay(attachment, country_code)
    return True


@app.task(ignore_result=True)
def save_transcription(attachment, country_code):
    try:
        credentials_file = os.path.join(settings.BASE_DIR, "speechtotextproject-293205-0198498c173f.json")
        credentials = service_account.Credentials.from_service_account_file(credentials_file)
        client = speech_v1p1beta1.SpeechClient(credentials=credentials)
        file_url = attachment.direct_url()
        file_name = urllib.request.urlopen(file_url)
        content = file_name.read()
        stream = [content]
        requests_data = (speech_v1p1beta1.StreamingRecognizeRequest(audio_content=chunk) for chunk in stream)
        language_code = get_language_code_by_country_code(country_code)
        config = speech_v1p1beta1.RecognitionConfig(
            encoding=speech_v1p1beta1.RecognitionConfig.AudioEncoding.MP3,
            sample_rate_hertz=16000,
            language_code=language_code
        )
        streaming_config = speech_v1p1beta1.StreamingRecognitionConfig(config=config)
        responses = client.streaming_recognize(streaming_config, requests_data)
        responses_list = []
        for response in responses:
            response_dict = {}
            for result in response.results:
                for alternative in result.alternatives:
                    response_dict['transcript_data'] = alternative.transcript
                transcript_time = str(result.result_end_time).split(".")[0]
                response_dict['end_time'] = transcript_time
                responses_list.append(response_dict)
        transcript_data = {"transcript_list": responses_list}
        attachment.audio_transcript_data = transcript_data
        attachment.save()
    except Exception as e:
        _logger.error("some error occured while audio transcription in this attachment %s", attachment.id)
