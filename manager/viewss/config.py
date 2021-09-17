
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response

from registration.mixins import HasGroupPermission
from registration.models import GROUP_NAME_MANAGER

class ConfigView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, format=None):
        if request.user.email in settings.REPORT_PERMISSION_EMAIL_LIST:
            show_report_tab = True
        else:
            show_report_tab = False
        return Response({
            "USER_ID": request.user.id,
            "USER_EMAIL": request.user.email,
            "RHEA_PROTOCOL": settings.RHEA_PROTOCOL,
            "RHEA_DOMAIN": settings.RHEA_DOMAIN,
            "RHEA_BASE_URL": settings.RHEA_BASE_URL,
            "BRAND_NAME": settings.BRAND_NAME,
            "BRAND_SHORTNAME": settings.BRAND_SHORTNAME,
            "SHOW_REPORT_TAB": show_report_tab,
            **settings.FRONTEND_CONFIG["MANAGER"],
            **settings.FRONTEND_CONFIG["COMMON"],
        })
