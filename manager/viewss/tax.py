from rest_framework.views import APIView
from rest_framework.response import Response
from manager.service import tax as tax_service
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import TaxSerializer
from manager.models import MPTax
from django.http import HttpResponse
from kronos.exceptions import AppLogicError
from rest_framework.permissions import AllowAny
from manager.decorator import rate_limit
class PublicTaxView(APIView):
    permission_classes = [AllowAny]
    @rate_limit
    def get(self, request, format=None):
        taxs = tax_service.find_all_taxs()
        return Response(TaxSerializer(taxs, many=True).data)
    
class TaxView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self, request, format=None):
        taxs = tax_service.find_all_taxs()
        return Response(TaxSerializer(taxs, many=True).data)

    def post(self, request):
        if request.data.get('name'):
            if MPTax.objects.filter(name=request.data.get('name')).exists():
                raise AppLogicError('Tax is already exists')
        tax_s = TaxSerializer(data=request.data)
        tax_s.is_valid(raise_exception=True)
        tax = tax_s.deserialize()
        savedTax = tax_service.save(tax)
        return Response(TaxSerializer(savedTax).data)

class PublicTaxIdView(APIView):
    permission_classes=[AllowAny]
    @rate_limit
    def get(self, request, tax_id, format=None):
        audit = tax_service.find_tax_by_id(tax_id)
        return Response(TaxSerializer(audit).data)
    
class TaxIdView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER],
        'DELETE': [GROUP_NAME_MANAGER]
    }
    def get(self, request, tax_id, format=None):
        audit = tax_service.find_tax_by_id(tax_id)
        return Response(TaxSerializer(audit).data)

    def post(self, request, tax_id):
        new_name = request.data.get('name')
        tax = MPTax.objects.get(id=tax_id)
        if new_name and new_name != tax.name:
            if MPTax.objects.filter(name=new_name).exists():
                raise AppLogicError('Tax is already exists')
        tax.name =new_name
        tax.rate =request.data.get('rate')
        tax.save()
        return Response(TaxSerializer(tax).data)

    def delete(self, request, tax_id):
        tax_service.delete(tax_id)
        return HttpResponse(status=204)
    