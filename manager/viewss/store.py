from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from client.service import store as store_service

from ..serializers import StoreSerializer, StoreDeSerializer


class StoreViewByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, client_id, format=None):
        stores = store_service.find_stores_by_client(client_id)
        return Response(StoreSerializer(stores, many=True).data)

class StoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, store_id, format=None):
        store = store_service.find_store_by_id(store_id)
        return Response(StoreSerializer(store).data)

    def post(self, request, store_id):
        store_ds = StoreDeSerializer(data=request.data, context={'id':store_id})
        store_ds.is_valid(raise_exception=True)
        store = store_ds.deserialize()
        savedStore = store_service.save(store)
        return Response(StoreSerializer(savedStore).data)

    def delete(self, request, store_id):
        store_service.delete(store_id)
        return HttpResponse(status=204)

class StoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request):
        store_ds = StoreDeSerializer(data=request.data)
        store_ds.is_valid(raise_exception=True)
        store = store_ds.deserialize()
        savedStore = store_service.save(store)
        return Response(StoreSerializer(savedStore).data)

