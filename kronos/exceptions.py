import logging

from django.http import Http404

_logger = logging.getLogger(__name__)

class ObjectNotFound(Exception):
    pass

class AppLogicError(Exception):
    pass

class KronosExceptionMiddleware(object):
    def process_exception(self, request, exception):
        if isinstance(exception, ObjectNotFound):
            _logger.info("raising Http404 for path: %s", request.path)
            raise Http404 from exception
        if isinstance(exception, AppLogicError):
            _logger.info("raising ValidationError for path: %s", request.path)
            raise ValidationError({
                'non_field_errors': [exception.__str__()]
            })

