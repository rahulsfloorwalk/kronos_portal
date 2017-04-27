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
        if isinstance(e, ObjectNotFound):
            _logger.info("returning 404 for path: %s, for ObjectNotFound exception", request.path)
            return HttpResponse(json.dumps({
                    'non_field_errors': ["Not Found"]
                }),
                status=404,
                content_type="application/json"
            )
        if isinstance(e, AppLogicError):
            _logger.info("returning 400 for AppLogicError on path: '%s', with value: '%s'", request.path, e.__str__())
            return HttpResponse(json.dumps({
                    'non_field_errors': [e.__str__()]
                }),
                status=400,
                content_type="application/json"
            )

