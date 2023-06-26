from rest_framework.views import APIView
from rest_framework.response import Response
from manager.service import category as category_service
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import CategorySerializer
from manager.models import MPCategory
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
class CategoryView(APIView):
    permission_classes = [AllowAny]
    # required_groups = {
    #     'GET': [GROUP_NAME_MANAGER],
    #     'POST': [GROUP_NAME_MANAGER]
    # }
    def get(self, request, format=None):
        cats = category_service.find_all_categories()
        return Response(CategorySerializer(cats, many=True).data)

    def post(self, request):
        cat_s = CategorySerializer(data=request.data)
        cat_s.is_valid(raise_exception=True)
        cat = cat_s.deserialize()
        savedCategory =category_service.save(cat)
        return Response(CategorySerializer(savedCategory).data)

class CategoryIdView(APIView):
    permission_classes = [AllowAny]
    # required_groups = {
    #     'GET': [GROUP_NAME_MANAGER],
    #     'POST': [GROUP_NAME_MANAGER],
    #     'DELETE': [GROUP_NAME_MANAGER]
    # }
    def get(self, request, category_id, format=None):
        category = category_service.find_category_by_id(category_id)
        return Response(CategorySerializer(category).data)

    def post(self, request, category_id):
        cat = MPCategory.objects.get(id=category_id)
        cat.name =request.data.get('name')
        cat.save()
        return Response(CategorySerializer(cat).data)

    def delete(self, request, category_id):
        category_service.delete(category_id)
        return HttpResponse(status=204)
    