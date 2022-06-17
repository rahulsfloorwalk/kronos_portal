from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission

from client.service.store_import_xlsx import find_sample_xlsx_for_store_insert, import_store_by_xlsx_sheet
from client.service import store as store_service
from client.models import Store

from manager.serializers import StoreSerializer, StoreImportDeSerializer

class StoreDeSerializer(ModelSerializer):
    class Meta:
        model = Store
        fields = (
            'id',
            'name',
            'address',
            'client',
            'code',
            'pincode',
            'type',
            'phone',
            'priority',
            'city',
            'map_location_link'
        )
        read_only_fields = ('id',)
        validators=[]

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            store = Store.objects.get(id=self.context.get('id'))
        else:
            store = Store()
        store.name = self.validated_data.get('name', store.name)
        store.address = self.validated_data.get('address', store.address)
        store.city = self.validated_data.get('city', store.city_id)
        store.client = self.validated_data.get('client', store.client_id)
        store.code = self.validated_data.get('code', store.code)
        store.pincode = self.validated_data.get('pincode', store.pincode)
        store.map_location_link = self.validated_data.get('map_location_link', store.map_location_link)
        store.type = self.validated_data.get('type', store.type)
        store.priority = self.validated_data.get('priority', store.priority)
        store.phone = self.validated_data.get('phone', store.phone)
        return store


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
        if request.data['store_region'] == 'state':
            savedStore = store_service.create_store_by_state(request.data)
            savedStore = savedStore[0] if savedStore else savedStore
        elif request.data['store_region'] == 'city':
            savedStore = store_service.save(store)
        return Response(StoreSerializer(savedStore).data)

class ImportStoreView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER]
    }
    def post(self, request, client_id):
        form = StoreImportDeSerializer(request.data, request.FILES)
        if form.is_valid():
            import_store_by_xlsx_sheet(client_id, request.FILES['file_uploaded'])
        return Response(status=200)


class StoreSampleXlsxView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER]
    }
    def get(self, request, client_id):
        report, name = find_sample_xlsx_for_store_insert()
        response = HttpResponse(report.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="' + name + '"'
        return response