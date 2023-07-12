from rest_framework.views import APIView
from rest_framework.response import Response
from manager.service import industry as industry_service
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import IndustrySerializer
from manager.models import MPIndustry
from django.http import HttpResponse
from kronos.exceptions import AppLogicError
from rest_framework.permissions import AllowAny
# from manager.decorator import rate_limit
class PublicIndustryView(APIView):
    permission_classes = [AllowAny]
    # @rate_limit
    def get(self, request, format=None):
        industry = industry_service.find_all_industries()
        return Response(IndustrySerializer(industry, many=True).data)

class IndustryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        industry = industry_service.find_all_industries()
        return Response(IndustrySerializer(industry, many=True).data)

    def post(self, request):
        if request.data.get('name'):
            if MPIndustry.objects.filter(name=request.data.get('name')).exists():
                raise AppLogicError('Industry is already exists')
        industry_s = IndustrySerializer(data=request.data)
        industry_s.is_valid(raise_exception=True)
        industry = industry_s.deserialize()
        savedIndustry =industry_service.save(industry)
        return Response(IndustrySerializer(savedIndustry).data)

class PublicIndustryIdView(APIView):
    permission_classes = [HasGroupPermission]
    # @rate_limit
    def get(self, request, industry_id, format=None):
        industry = industry_service.find_industry_by_id(industry_id)
        return Response(IndustrySerializer(industry).data)
class IndustryIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, industry_id, format=None):
        industry = industry_service.find_industry_by_id(industry_id)
        return Response(IndustrySerializer(industry).data)

    def post(self, request, industry_id):
        new_name = request.data.get('name')
        industry = MPIndustry.objects.get(id=industry_id)
        if new_name and new_name != industry.name:
            if MPIndustry.objects.filter(name=new_name).exists():
                raise AppLogicError('Industry is Already Exists')
        industry.name =new_name
        industry.save()
        return Response(IndustrySerializer(industry).data)

    def delete(self, request, industry_id):
        industry_service.delete(industry_id)
        return HttpResponse(status=204)
 