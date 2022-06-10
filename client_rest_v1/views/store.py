from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from client.service.store_import_xlsx import find_sample_xlsx_for_store_insert, import_store_by_xlsx_sheet

from registration.models import GROUP_NAME_CLIENT
from registration.mixins import HasGroupPermission

from client.service import store as store_service, client_service

from ..serializers import StoreImportDeSerializer, StoreSerializer, StoreDeSerializer



class StoreIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT],
        'DELETE': [GROUP_NAME_CLIENT]
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
        'GET': [GROUP_NAME_CLIENT],
        'POST': [GROUP_NAME_CLIENT]
    }

    def get(self, request, format=None):
        client = client_service.find_client_by_user_id(request.user.id)
        stores = store_service.find_stores_by_client(client.id)
        return Response(StoreSerializer(stores, many=True).data)

    def post(self, request):
        store_ds = StoreDeSerializer(data=request.data)
        store_ds.is_valid(raise_exception=True)
        store = store_ds.deserialize()
        if request.data['store_region'] == 'state':
            savedStore = store_service.create_store_by_state(request.data)
            savedStore = savedStore[0] if savedStore else savedStore
        elif request.data['store_region'] == 'city':
            savedStore = store_service.save(store)
        return Response(StoreSerializer(savedStore).data)

class ImportStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_CLIENT]
    }
    def post(self, request):
        form = StoreImportDeSerializer(request.data, request.FILES)
        if form.is_valid():
            client = client_service.find_client_by_user_id(request.user.id)
            import_store_by_xlsx_sheet(client.id, request.FILES['file_uploaded'])
        return Response(status=200)


class StoreSampleXlsxView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_CLIENT]
    }
    def get(self, request):
        report, name = find_sample_xlsx_for_store_insert()
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response