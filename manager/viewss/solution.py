from rest_framework.views import APIView
from rest_framework.response import Response
from manager.service import solution as solution_service
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.serializers import SolutionSerializer
from manager.models import MPSolutions
from django.http import HttpResponse
class SolutionView(APIView):
    def get(self, request, format=None):
        solutions = solution_service.find_all_solutions()
        return Response(SolutionSerializer(solutions, many=True).data)
    
    def post(self, request):
        solution_s = SolutionSerializer(data=request.data)
        solution_s.is_valid(raise_exception=True)
        solution = solution_s.deserialize()
        savedSolution = solution_service.save(solution)
        return Response(SolutionSerializer(savedSolution).data)
    
class SolutionIdView(APIView):
    def get(self, request, solution_id, format=None):
        solution = solution_service.find_solution_by_id(solution_id)
        return Response(SolutionSerializer(solution).data)
    def post(self, request, solution_id):
        solution = MPSolutions.objects.get(id=solution_id)
        solution.name =request.data.get('name')
        solution.url_structure =request.data.get('url_structure')
        solution.price =request.data.get('price')
        solution.category_id =request.data.get('category')
        solution.sub_category_id =request.data.get('sub_category')
        solution.tax_id =request.data.get('tax')
        solution.about =request.data.get('about')
        solution.overview =request.data.get('overview')
        solution.how_it_work =request.data.get('how_it_work')
        solution.execution_time =request.data.get('execution_time')
        solution.short_description =request.data.get('short_description')
        solution.is_active =request.data.get('is_active')
        
        solution.save()
        return Response(SolutionSerializer(solution).data)

    def delete(self, request, solution_id):
        solution_service.delete(solution_id)
        return HttpResponse(status=204)