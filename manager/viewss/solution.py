from rest_framework.views import APIView
from rest_framework.response import Response
from manager.service import solution as solution_service
from manager.serializers import SolutionSerializer
from manager.models import MPSolutions,MPSolutionImage
from django.http import HttpResponse
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from kronos.exceptions import ObjectNotFound
from rest_framework.permissions import AllowAny
class SolutionView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        solutions = MPSolutions.objects.all()
        serializer = SolutionSerializer(solutions, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = SolutionSerializer(data=request.data)
        if serializer.is_valid():
            solution = serializer.save()
            uploaded_images = request.FILES.getlist('images')  # Get multiple images from request.FILES
            for image in uploaded_images:
                MPSolutionImage.objects.create(solution=solution, image=image)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class SolutionIdView(APIView):
    permission_classes = [AllowAny]
    def get_object(self, solution_id):
        try:
            return MPSolutions.objects.get(pk=solution_id)
        except MPSolutions.DoesNotExist as e:
            raise ObjectNotFound from e

    def get(self, request, solution_id):
        solution = self.get_object(solution_id)
        serializer = SolutionSerializer(solution)
        return Response(serializer.data)

    def put(self, request, solution_id):
        solution = self.get_object(solution_id)
        serializer = SolutionSerializer(solution, data=request.data)
        if serializer.is_valid():
            serializer.save()
            image_data = request.FILES.getlist('images')
            MPSolutionImage.objects.filter(solution=solution).delete()
            for img in image_data:
                MPSolutionImage.objects.create(solution=solution, image=img)

            return Response(serializer.data)
        return Response(serializer.errors)

    def delete(self, request, solution_id):
        solution = self.get_object(solution_id)
        solution.delete()
        MPSolutionImage.objects.filter(solution=solution_id).delete()
        return Response(status=204)
