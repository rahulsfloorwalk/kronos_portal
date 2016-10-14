from rest_framework import routers, viewsets
from rest_framework.serializers import ModelSerializer, ValidationError

from .models import City, Location, Client, Audit, AuditLocation

class ClientSerializer(ModelSerializer):
    class Meta:
        model = Client
        fields = (
            'id',
            'name',
            'email',
            'phone',
        )
        read_only_fields = ('id',)

    def save(self, **kwargs):
        client = Client()
        client.name = kwargs['data']['name']
        client.email = kwargs['data']['email']
        client.phone = kwargs['data']['phone']

        client.save()
        return client
