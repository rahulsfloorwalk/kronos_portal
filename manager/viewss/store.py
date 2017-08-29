from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User, Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from registration.models import GROUP_NAME_AUDITOR, GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from client.service import store as store_service

from client.models import Store
from ..serializers import StoreSerializer, StoreDeSerializer


class StoreViewByClient(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
        }
    def get(self, request, client_id, format=None):
        try:
            stores = Store.objects.filter(client_id=client_id).all()
            return Response(StoreSerializer(stores, many=True).data)
        except Store.DoesNotExist:
            raise Http404

class StoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
            'GET' : [GROUP_NAME_MANAGER],
            'POST': [GROUP_NAME_MANAGER],
            'DELETE': [GROUP_NAME_MANAGER]
        }
    def get(self, request, store_id, format=None):
        try:
            store = Store.objects.get(pk=store_id)
            return Response(StoreSerializer(store).data)
        except Store.DoesNotExist:
            return Http404

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
