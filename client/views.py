from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Client, Audit, Location, AuditLocation
from .serializers import ClientSerializer

class ClientView(APIView):
    def get(self, request, format=None):
        try:
            client = Client.objects.all()
            print(client)
            return Response(ClientSerializer(client, many=True).data)
        except Client.DoesNotExist:
            raise Http404

    def post(self, request):
        client_s = ClientSerializer(data=request.data)
        client_s.is_valid(raise_exception=True)
        client = client_s.save(data=request.data)
        return Response(ClientSerializer(client).data)

class LocationView(APIView):
    def get(self, request, format=None):
        return None

class AuditView(APIView):
    def get(self, request, format=None):
        return None

class AuditLocationView(APIView):
    def get(self, request, format=None):
        return None
