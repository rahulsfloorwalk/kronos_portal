
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.models import MPSolution,MPSolutionQuestion
from manager.serializers import SolutionSerializer,SolutionStatusSerializer,AttachmentSerializer
from kronos.exceptions import ObjectNotFound,AppLogicError
from manager.service import solution_attachement_service
from rest_framework.exceptions import ValidationError
from manager.service import question_service
from rest_framework.permissions import AllowAny
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
            'short_description',
            'is_active'
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
        solution.is_active = self.validated_data.get('is_active',solution.is_active)

class SolutionQuestionDeSerializer(ModelSerializer):
    class Meta:
        model = MPSolutionQuestion
        fields= (
            'id',
            'sequence',
            'question_txt',
            'max_marks',
            'solution',
            'question_type',
            'question_data',
            'hide_question',
            'optional_comment_required'
        )
        read_only_fields=('id',)
    
    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is None:
            question = MPSolutionQuestion.objects.get(id=self.context.get('id'))
        else:
            question=MPSolutionQuestion()
        question.sequence = self.validated_data.get('sequence', question.sequence)
        question.question_txt = self.validated_data.get('question_txt', question.question_txt)
        question.max_marks = self.validated_data.get('max_marks', question.max_marks)
        question.solution = self.validated_data.get('solution', question.solution_id)
        question.question_type = self.validated_data.get('question_type', question.question_type)
        question.question_data = self.validated_data.get('question_data', question.question_data)
        question.hide_question = False
        question.optional_comment_required = False
        return question

class SolutionQuestionSerializer(ModelSerializer):
    class Meta:
        model = MPSolutionQuestion
        fields = (
            'id',
            'sequence',
            'question_txt',
            'max_marks',
            'solution',
            'question_type',
            'question_data'
        )
        read_only_fields = fields

class SolutionQuestionView(APIView):
    permission_classes=[HasGroupPermission]
    renderer_classes={
        'POST':[GROUP_NAME_MANAGER]
    }
    def post(self,request):
        q_ds= SolutionQuestionDeSerializer(data=request.data)
        q_ds.is_valid(raise_exception=True)
        question = q_ds.deserialize()
        saved_question = question_service.save(question)
        return Response(SolutionQuestionSerializer(saved_question).data)

class SolutionView(APIView):
    permission_classes=[HasGroupPermission]
    renderer_groups={
        'GET':[GROUP_NAME_MANAGER],
        'POST':[GROUP_NAME_MANAGER]
    }
    def get(self,request):
        solutions = MPSolution.objects.filter(is_active=True)
        serializer = SolutionSerializer(solutions, many=True)  
        return Response(serializer.data)
    def post(self,request):
        if request.data.get('name'):
            if MPSolution.objects.filter(name=request.data.get('name')).exists():
                raise AppLogicError('Solution is already exists')
        serializer = SolutionDeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        solution = serializer.save()  
        serializer = SolutionSerializer(solution)
        return Response(serializer.data)
    
class ArchievedSolutionView(APIView):
    permission_classes=[HasGroupPermission]
    renderer_groups={
        'GET':[GROUP_NAME_MANAGER],
    }
    def get(self,request):
        solutions = MPSolution.objects.filter(is_active=False)
        serializer = SolutionSerializer(solutions, many=True)  
        return Response(serializer.data)
    
class SolutionIdView(APIView):
    permission_classes=[HasGroupPermission]
    renderer_groups={
        'GET':[GROUP_NAME_MANAGER],
        'POST':[GROUP_NAME_MANAGER],
        'DELETE':[GROUP_NAME_MANAGER]
    }
    
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
        if request.data.get('name'):
            if MPSolution.objects.filter(name=request.data.get('name')).exists():
                raise AppLogicError('Solution is already exists')
        solution = self.get_solution(solution_id)
        serializer = SolutionDeSerializer(solution, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, solution_id):
        solution = self.get_solution(solution_id)
        solution.delete()
        return Response()
    
class SolutionStatusDeSerializer(ModelSerializer):
    class Meta:
        model = MPSolution
        fields = (
            'id',
            'is_active'
            )
        read_only_fields =('id',)
    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is not None:
            solution = MPSolution.objects.get(id=self.context.get('id'))
        else:
            solution = MPSolution()
        solution.is_active = self.validated_data.get('is_active',solution.is_active)    

class SolutionStatusIdView(APIView):
    permission_classes=[HasGroupPermission]
    renderer_groups={
        'GET':[GROUP_NAME_MANAGER],
        'POST':[GROUP_NAME_MANAGER],
    }
    def get_solution(self, solution_id):
        try:
            return MPSolution.objects.get(pk=solution_id)
        except MPSolution.DoesNotExist as e:
            raise ObjectNotFound from e
    def get(self, request, solution_id):
        solution = self.get_solution(solution_id)
        serializer = SolutionStatusSerializer(solution)
        return Response(serializer.data)
    def post(self,request,solution_id):
        solution = self.get_solution(solution_id)
        serializer = SolutionStatusDeSerializer(solution, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        
class SolutionAttachmentView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups ={
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self,request,solution_id):
        attachment = solution_attachement_service.find_attachment_by_solution_id(solution_id)
        return Response(AttachmentSerializer(attachment,many=True).data)
    def post(self,request,solution_id):
        try:
            post_data, attachment = solution_attachement_service.solution_image_upload_by_solution_id(
                solution_id,
                request.data["file_name"],
                request.data["file_size"],
                request.data["file_type"])
            post_data["attachment"] = AttachmentSerializer(attachment).data
            return Response(post_data)
        except KeyError as e:
            raise ValidationError({
                'file_name': "file name is required"
            })
class SolutionDeleteView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups = {
        'DELETE': [GROUP_NAME_MANAGER],
    }
    def delete(self,request,attachment_id):
        solution_attachement_service.delete_for_solution(attachment_id,request.data)
        return Response()

class SolutionAttachmentCompleteView(APIView):
    permission_classes = [AllowAny]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, attachment_id):
        attachment = solution_attachement_service.complete_for_solution(attachment_id, request.data)
        return Response(AttachmentSerializer(attachment).data)
