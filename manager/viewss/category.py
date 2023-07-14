from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from manager.service import category as category_service
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import CategorySerializer,AttachmentSerializer
from manager.models import MPCategory
from manager.service import category_attachement_service
from kronos.exceptions import AppLogicError,ObjectNotFound
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
# from manager.decorator import rate_limit
class PublicCategoryView(APIView):
    permission_classes = [AllowAny]
    # @rate_limit
    def get(self, request, format=None):
        cats = category_service.find_all_categories()
        serializer = CategorySerializer(cats, many=True)
        return Response(serializer.data)
class CategoryView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        cats = category_service.find_all_categories()
        serializer = CategorySerializer(cats, many=True)
        return Response(serializer.data)
        
    def post(self, request):
        if request.data.get('name'):
            if MPCategory.objects.filter(name=request.data.get('name')).exists():
                raise AppLogicError('Category is already exists')
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
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
    
class PublicCategoryAttachmentView(APIView):
    permission_classes=[AllowAny]
    def get(self,request,category_id):
        attachement = category_attachement_service.find_attachment_by_category_id(category_id)
        return Response(AttachmentSerializer(attachement).data)
class CategoryAttachmentView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups ={
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self,request,category_id):
        attachment = category_attachement_service.find_attachment_by_category_id(category_id)
        return Response(AttachmentSerializer(attachment).data)
    def post(self,request,category_id):
        try:
            post_data, attachment = category_attachement_service.category_image_upload_by_category_id(
                category_id,
                request.data["file_name"],
                request.data["file_size"],
                request.data["file_type"])
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })
class CategoryDeleteView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_MANAGER],
    }
    def delete(self,request,attachment_id):
        category_attachement_service.delete_for_category(attachment_id,request.data)
        return Response()
class CategoryAttachmentCompleteView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, attachment_id):
        attachment = category_attachement_service.complete_for_category(attachment_id, request.data)
        return Response(AttachmentSerializer(attachment).data)