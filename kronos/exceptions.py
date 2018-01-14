import traceback
import sys
import logging
import json

from django.http import HttpResponse

_logger = logging.getLogger(__name__)

class ObjectNotFound(Exception):
    pass

class AppLogicError(Exception):
    pass

class KronosExceptionMiddleware(object):
    def process_exception(self, request, e):
        frame = traceback.extract_tb(sys.exc_info()[-1], limit=-1)[0]
        if isinstance(e, ObjectNotFound):
            _logger.info("404 for path: %s caused by ObjectNotFound at %s, %s, %s", request.path, frame.filename, frame.lineno, frame.name)
            return HttpResponse(
                json.dumps({
                    'non_field_errors': ["Not Found"]
                }),
                status=404,
                content_type="application/json"
            )
        if isinstance(e, AppLogicError):
            _logger.info("400 for path: %s caused by AppLogicError(\"%s\") at %s, %s, %s", request.path, e.args[0], frame.filename, frame.lineno, frame.name)
            return HttpResponse(
                json.dumps({
                    'non_field_errors': [e.__str__()]
                }),
                status=400,
                content_type="application/json"
            )

