import traceback
import sys
import logging

from rest_framework.response import Response

from kronos.exceptions import AppLogicError, ObjectNotFound

_logger = logging.getLogger(__name__)

def kronos_exception_handler(exc, context):
    frame = traceback.extract_tb(sys.exc_info()[-1], limit=-1)[0]
    if isinstance(exc, ObjectNotFound):
        _logger.info("404 for path: %s caused by ObjectNotFound at %s, %s, %s", context['request'].path, frame.filename, frame.lineno, frame.name)
        return Response(
            {'non_field_errors': ["not found"]},
            status=404,
        )
    if isinstance(exc, AppLogicError):
        _logger.info("400 for path: %s caused by AppLogicError(\"%s\") at %s, %s, %s", context['request'].path, exc.args[0], frame.filename, frame.lineno, frame.name)
        return Response(
            {'non_field_errors': [exc.__str__()]},
            status=400,
        )
