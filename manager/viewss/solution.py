from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import Serializer, CharField, ModelSerializer, IntegerField
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.models import MPSolution
from manager.serializers import SolutionSerializer
from rest_framework.permissions import AllowAny
from kronos.exceptions import ObjectNotFound

class SolutionDeSerializer(ModelSerializer):
    class Meta:
        model = MPSolution
        fields = (
            'id',
            'name',
            'url_structure',
            'price',
            'about',
            'category',
            'sub_category',
            'tax',
            'overview',
            'how_it_work',
            'execution_time',
            'short_description'
            )
        read_only_fields =('id',)
    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            solution = MPSolution.objects.get(id=self.context.get('id'))
        else:
            solution = MPSolution()
        solution.name = self.validated_data.get('name', solution.name)
        solution.url_structure = self.validated_data.get('url_structure', solution.url_structure)
        solution.price = self.validated_data.get('price', solution.price)
        solution.about = self.validated_data.get('about', solution.about)
        solution.category = self.validated_data.get('category', solution.category_id)
        solution.sub_category = self.validated_data.get('sub_category', solution.sub_category_id)
        solution.tax = self.validated_data.get('tax', solution.tax_id)
        solution.overview = self.validated_data.get('overview', solution.overview)
        solution.how_it_work = self.validated_data.get('how_it_work', solution.how_it_work)
        solution.execution_time = self.validated_data.get('execution_time', solution.execution_time)
        solution.short_description = self.validated_data.get('short_description', solution.short_description)
        
        
class SolutionView(APIView):
    permission_classes=[AllowAny]
    # permission_classes=[HasGroupPermission]
    # renderer_groups={
    #     'GET':[GROUP_NAME_MANAGER],
    #     'POST':[GROUP_NAME_MANAGER]
    # }
    def get(self,request):
        solutions = MPSolution.objects.all()
        serializer = SolutionSerializer(solutions, many=True)  
        return Response(serializer.data)
    def post(self,request):
        serializer = SolutionDeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        solution = serializer.save()  
        serializer = SolutionSerializer(solution)
        return Response(serializer.data)
class SolutionIdView(APIView):
    permission_classes=[AllowAny]
    def get_solution(self, solution_id):
        try:
            return MPSolution.objects.get(pk=solution_id)
        except MPSolution.DoesNotExist as e:
            raise ObjectNotFound from e

    def get(self, request, solution_id):
        solution = self.get_solution(solution_id)
        serializer = SolutionSerializer(solution)
        return Response(serializer.data)

    def post(self, request, solution_id):
        solution = self.get_solution(solution_id)
        serializer = SolutionDeSerializer(solution, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, solution_id):
        solution = self.get_solution(solution_id)
        solution.delete()
        return Response()