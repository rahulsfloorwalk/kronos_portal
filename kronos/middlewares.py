
from django.conf import settings

class PhoebeVersionHeaderMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['X-Phoebe-Version'] = settings.PHOEBE_VERSION
        return response

