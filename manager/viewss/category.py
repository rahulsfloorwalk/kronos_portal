from rest_framework.views import APIView
from rest_framework.response import Response
from manager.service import category as category_service
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import CategorySerializer
from manager.models import MPCategory
from kronos.exceptions import AppLogicError,ObjectNotFound
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
# from manager.decorator import rate_limit
from rest_framework.parsers import MultiPartParser, FormParser
class PublicCategoryView(APIView):
    permission_classes = [AllowAny]
    # @rate_limit
    def get(self, request, format=None):
        cats = category_service.find_all_categories()
        serializer = CategorySerializer(cats, many=True)
        return Response(serializer.data)
class CategoryView(APIView):
    permission_classes = [AllowAny]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    # parser_classes = (MultiPartParser, FormParser)
    def get(self, request, format=None):
        cats = category_service.find_all_categories()
        serializer = CategorySerializer(cats, many=True)
        return Response(serializer.data)
        
    def post(self, request):
        if request.data.get('name'):
            if MPCategory.objects.filter(name=request.data.get('name')).exists():
                raise AppLogicError('Category is already exists')
        print("34",request.data)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
        # return Response()
class PublicCategoryIdView(APIView):
    permission_classes = [AllowAny]
    def get_object(self, category_id):
        try:
            return MPCategory.objects.get(pk=category_id)
        except MPCategory.DoesNotExist as e:
            raise ObjectNotFound
    # @rate_limit
    def get(self, request, category_id):
        category = self.get_object(category_id)
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    
class CategoryIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get_object(self, category_id):
        try:
            return MPCategory.objects.get(pk=category_id)
        except MPCategory.DoesNotExist as e:
            raise ObjectNotFound

    def get(self, request, category_id):
        category = self.get_object(category_id)
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def post(self, request, category_id):
        new_name=request.data.get('name')
        cat = MPCategory.objects.get(pk=category_id)
        if new_name and new_name != cat.name:
            if MPCategory.objects.filter(name=new_name).exists():
                raise AppLogicError('Category is already exists')
        category = self.get_object(category_id)
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, category_id):
        category = self.get_object(category_id)
        category.delete()
        return Response(status=204)
    