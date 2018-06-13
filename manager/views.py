from django.core.exceptions import PermissionDenied

from rest_framework.views import APIView

from registration.models import GROUP_NAME_MANAGER
from registration.models import GROUP_NAME_MODERATOR

class GroupAPIView(APIView):
    def __init__(self, group_name):
        self._group_name = group_name

    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name=self._group_name).exists():
            return super(GroupAPIView, self).dispatch(request, *args, **kwargs)
        else:
            raise PermissionDenied

class ManagerAPIView(GroupAPIView):
    def __init__(self):
        super(ManagerAPIView, self).__init__(GROUP_NAME_MANAGER)

class ModeratorAPIView(GroupAPIView):
    def __init__(self):
        super(ManagerAPIView, self).__init__(GROUP_NAME_MODERATOR)
