
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from manager.models import MPSolution,MPSolutionQuestion,MPSolutionOtherDetails
from manager.serializers import SolutionStatusSerializer
from manager.serializers import AttachmentSerializer
from manager.serializers import SolutionSerializer
from kronos.exceptions import ObjectNotFound,AppLogicError
from rest_framework.exceptions import ValidationError
from manager.service import solution_proof_tag,details_service,question_service,solution_attachement_service
from manager.service import category as category_service
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
    permission_classes = [HasGroupPermission]
    required_groups = {
        'POST': [GROUP_NAME_MANAGER],
    }
    def post(self, request, attachment_id):
        attachment = solution_attachement_service.complete_for_solution(attachment_id, request.data)
        return Response(AttachmentSerializer(attachment).data)

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
        question.question_type = self.validated_data.get('question_type', question.question_type)
        question.solution = self.validated_data.get('solution', question.solution_id)
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

class SolutionQuestionAddView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'POST':[GROUP_NAME_MANAGER]
    }
    def post(self,request):
        q_ds= SolutionQuestionDeSerializer(data=request.data)
        q_ds.is_valid(raise_exception=True)
        question = q_ds.deserialize()
        saved_question = question_service.save(question)
        return Response(SolutionQuestionSerializer(saved_question).data)

class QuestionViewBySolution(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
    }
    def get(self, request, solution_id, format=None):
        questions = question_service.find_questions_by_solution_id(solution_id)
        return Response(SolutionQuestionSerializer(questions, many=True).data)

class SolutionQuestionIdView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER],
        'POST':[GROUP_NAME_MANAGER],
        'DELETE':[GROUP_NAME_MANAGER]
    }
    def get_question(self, question_id):
        try:
            return MPSolutionQuestion.objects.get(pk=question_id)
        except MPSolutionQuestion.DoesNotExist as e:
            raise ObjectNotFound from e

    def get(self, request, question_id):
        question = self.get_question(question_id)
        serializer = SolutionQuestionSerializer(question)
        return Response(serializer.data)

    def post(self, request, question_id):
        question = self.get_question(question_id)
        serializer = SolutionQuestionDeSerializer(question, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, question_id):
        question = self.get_question(question_id)
        question.delete()
        return Response()
    
class SolutionProofTag(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        'GET': [GROUP_NAME_MANAGER],
        'POST': [GROUP_NAME_MANAGER]
    }
    def get(self,request,solution_id):
        proof_tag = solution_proof_tag.get_solution_proof_tag(solution_id)
        return Response(proof_tag)
    def post(self,request,solution_id):
        proof_tag = solution_proof_tag.save_proof_tag(solution_id,request.data['proof_tag_list'])
        return Response(SolutionSerializer(proof_tag).data)
  
class SolutionOtherDetailsDeSerializer(ModelSerializer):
    class Meta:
        model=MPSolutionOtherDetails
        fields=('id',
                'solution',
                'description',
                'post_approval_description',
                'check_points',
                'audit_fee'
        )
        read_only_fields = ('id',)
    def deserialize(self):
        if 'id' in self.context and self.context.get('id') is None:
            details = MPSolutionOtherDetails.objects.get(id=self.context.get('id'))
        else:
            details=MPSolutionOtherDetails()
        details.solution = self.validated_data.get('solution', details.solution_id)
        details.description = self.validated_data.get('description',details.description)
        details.post_approval_description = self.validated_data.get('post_approval_description',details.post_approval_description)
        details.check_points = self.validated_data.get('check_points', details.check_points)
        details.audit_fee = self.validated_data.get('audit_fee', details.audit_fee)
        return details    

class SolutionOtherDetailsSerializer(ModelSerializer):
    class Meta:
        model = MPSolutionOtherDetails
        fields = (
            'id',
            'solution',
            'description',
            'post_approval_description',
            'check_points',
            'audit_fee'
        )
        read_only_fields = fields
            
class SolutionOtherDetailsAddView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'POST':[GROUP_NAME_MANAGER]
    }
    def post(self,request):
        d_ds = SolutionOtherDetailsDeSerializer(data=request.data)
        d_ds.is_valid(raise_exception=True)
        details = d_ds.deserialize()
        saved_details = details_service.save(details)
        return Response(SolutionOtherDetailsSerializer(saved_details).data)

class SolutionIdOtherDetailsAddView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER]
    }
    def get(self,request,solution_id):
        data= MPSolutionOtherDetails.objects.get(solution_id=solution_id)
        return Response(SolutionOtherDetailsSerializer(data).data)
class SolutionOtherDetailsView(APIView):
    permission_classes=[HasGroupPermission]
    required_groups={
        'GET':[GROUP_NAME_MANAGER],
        'POST':[GROUP_NAME_MANAGER]
    }
    def get_details(self,detail_id):
        try:
            return MPSolutionOtherDetails.objects.get(pk=detail_id)
        except MPSolutionOtherDetails.DoesNotExist as e:
            raise ObjectNotFound from e
    def get(self,request,detail_id):
        details=MPSolutionOtherDetails.objects.get(id=detail_id)
        return Response(SolutionOtherDetailsSerializer(details).data)
    def post(self,request,detail_id):
        detail = self.get_details(detail_id)
        serializer = SolutionOtherDetailsDeSerializer(detail,data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
class SolutionViewByCategoryIdView(APIView):
    permission_classes=[AllowAny]
    required_groups={
        'GET':[GROUP_NAME_MANAGER],
    }
    def get(self,request,category_id,format=None):
        category = category_service.find_category_by_id(category_id)
        solutions = MPSolution.objects.filter(category_id=category.id,is_active=True)
        serializer = SolutionSerializer(solutions, many=True)  
        return Response(serializer.data)