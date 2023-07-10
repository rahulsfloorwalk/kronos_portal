from rest_framework.views import APIView
from rest_framework.response import Response
from manager.service import interested_area as interest_area_service
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import InterestedAreaSerializer
from manager.models import MPInterestArea
from django.http import HttpResponse
from kronos.exceptions import AppLogicError
class InterestedAreaView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        int_area = interest_area_service.find_all_interested_area()
        return Response(InterestedAreaSerializer(int_area, many=True).data)

    def post(self, request):
        if request.data.get('name'):
            if MPInterestArea.objects.filter(name=request.data.get('name')).exists():
                raise AppLogicError('Industry is already exists')
        int_area_s = InterestedAreaSerializer(data=request.data)
        int_area_s.is_valid(raise_exception=True)
        int_area = int_area_s.deserialize()
        savedCategory =interest_area_service.save(int_area)
        return Response(InterestedAreaSerializer(savedCategory).data)

class InterestedAreaIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, interested_area_id, format=None):
        int_area = interest_area_service.find_interested_area_by_id(interested_area_id)
        return Response(InterestedAreaSerializer(int_area).data)

    def post(self, request, interested_area_id):
        int_area = MPInterestArea.objects.get(id=interested_area_id)
        int_area.name =request.data.get('name')
        int_area.save()
        return Response(InterestedAreaSerializer(int_area).data)

    def delete(self, request, interested_area_id):
        interest_area_service.delete(interested_area_id)
        return HttpResponse(status=204)
 