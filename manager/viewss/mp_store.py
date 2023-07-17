from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from manager.models import MPStore
from django.contrib.auth.models import User
from manager.serializers import CitySerializer
from manager.service import mp_store_service
from client.models import MPClientProfileInfo

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields=(
            'id',
            'email',
        )
        read_only_fields = fields
        
class MpStoreSerializer(ModelSerializer):
    city = CitySerializer()
    user = UserSerializer(required=False)
    class Meta:
        model = MPStore
        fields = (
            'id',
            'name',
            'address',
            'user',
            'code',
            'pincode',
            'map_location_link',
            'priority',
            'phone',
            'city',
        )
        read_only_fields = fields
    
class MpStoreDeSerializer(ModelSerializer):
    class Meta:
        model = MPStore
        fields = (
            'id',
            'name',
            'address',
            'user',
            'code',
            'pincode',
            'phone',
            'priority',
            'city',
            'map_location_link'
        )
        read_only_fields = ('id',)

    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            store = MPStore.objects.get(id=self.context.get('id'))
        else:
            store = MPStore()
        store.name = self.validated_data.get('name', store.name)
        store.address = self.validated_data.get('address', store.address)
        store.city = self.validated_data.get('city', store.city_id)
        store.code = self.validated_data.get('code', store.code)
        store.pincode = self.validated_data.get('pincode', store.pincode)
        store.map_location_link = self.validated_data.get('map_location_link', store.map_location_link)
        store.priority = self.validated_data.get('priority', store.priority)
        store.phone = self.validated_data.get('phone', store.phone)
        user_data = self.validated_data.get('user')
        if user_data is not None:
            store.user = user_data
        return store
        
class MpStoreView(APIView):
    permission_classes=[AllowAny]
    def get(self,request):
        if request.user.id:
            store= MPStore.objects.filter(user=request.user.id)
        else:
            store= MPStore.objects.all()
        return Response(MpStoreSerializer(store,many=True).data)
    def post(self,request):
        mp_store_ds = MpStoreDeSerializer(data=request.data)
        mp_store_ds.is_valid(raise_exception=True)
        mp_store = mp_store_ds.deserialize()
        saved_mpStore = mp_store_service.save(mp_store)
        return Response(MpStoreSerializer(saved_mpStore).data)