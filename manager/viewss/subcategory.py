from rest_framework.views import APIView
from rest_framework.response import Response
from manager.service import subcategory as subcategory_service
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import SubcategorySerializer
from manager.models import MPSubcategory
from django.http import HttpResponse
from kronos.exceptions import AppLogicError
class SubcategoryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        cats = subcategory_service.find_all_subcategories()
        return Response(SubcategorySerializer(cats, many=True).data)

    def post(self, request):
        if request.data.get('name'):
            if MPSubcategory.objects.filter(name=request.data.get('name')).exists():
                raise AppLogicError('Sub Category is already exists')
        cat_s = SubcategorySerializer(data=request.data)
        cat_s.is_valid(raise_exception=True)
        cat = cat_s.deserialize()
        savedCategory =subcategory_service.save(cat)
        return Response(SubcategorySerializer(savedCategory).data)

class SubcategoryIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, subcategory_id, format=None):
        category = subcategory_service.find_subcategory_by_id(subcategory_id)
        return Response(SubcategorySerializer(category).data)

    def post(self, request, subcategory_id):
        cat = MPSubcategory.objects.get(pk=subcategory_id)
        cat.name =request.data.get('name')
        cat.save()
        return Response(SubcategorySerializer(cat).data)

    def delete(self, request, subcategory_id):
        subcategory_service.delete(subcategory_id)
        return HttpResponse(status=204)
    