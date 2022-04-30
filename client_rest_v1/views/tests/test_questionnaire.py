from django.urls import reverse

from model_mommy import mommy
from expects import expect, equal

from faker import Faker

from audit.models.audit_cycle import AuditCycle
from questionnaire.models.question import Question
from questionnaire.service.questionnaire import insert_sample_questionnaire_to_audit_cycle

from .utils import ClientAPITestCase
from kronos.exceptions import AppLogicError
from questionnaire.models import Section
from questionnaire.models import Industry, ProblemStatement, SampleQuestionnaireType, SampleQuestionnaire

fake = Faker()

class SampleQuestionnaireTestCase(ClientAPITestCase):

    def setUp(self):
        super(SampleQuestionnaireTestCase, self).setUp()
        self.login()
        self.industry_id = 1
        self.industry_obj = mommy.make(Industry, id=self.industry_id)

    def test_get_retrieves_industry(self):
        mommy.make(Industry, id=2)
        mommy.make(Industry, id=3)
        mommy.make(Industry, id=4)

        response = self.client.get(reverse('client_rest_v1:industry_view'))

        expect(response.status_code).to(equal(200))
        expect(len(response.data)).to(equal(4))


    def test_get_retrieves_problem_statement(self):
        mommy.make(ProblemStatement, _quantity=4, industry = self.industry_obj)

        response = self.client.get(reverse('client_rest_v1:problem_statement_view', kwargs = {
            'industry_id': self.industry_id,
        }))

        expect(response.status_code).to(equal(200))
        expect(len(response.data)).to(equal(4))

        for i in response.data:
            expect(i['industry']).to(equal(self.industry_id))


    def test_get_retrieves_sample_questionnaire_types(self):

        problem_statement_obj = mommy.make(ProblemStatement, industry = self.industry_obj)

        mommy.make(SampleQuestionnaireType, _quantity=4, problem_statement = problem_statement_obj)

        response = self.client.get(reverse('client_rest_v1:questionnaire_type_view', kwargs = {
            'problem_statement_id': problem_statement_obj.id,
        }))

        expect(response.status_code).to(equal(200))
        expect(len(response.data)).to(equal(4))

        for i in response.data:
            expect(i['problem_statement']).to(equal(problem_statement_obj.id))


    def test_get_retrieves_sample_questionnaire(self):
        problem_statement_obj = mommy.make(ProblemStatement, industry = self.industry_obj)
        sample_questionnaire_type_obj1 = mommy.make(SampleQuestionnaireType, problem_statement = problem_statement_obj)
        sample_questionnaire_type_obj2 = mommy.make(SampleQuestionnaireType, problem_statement = problem_statement_obj)

        mommy.make(SampleQuestionnaire, sample_questionnaire_type = sample_questionnaire_type_obj1)
        mommy.make(SampleQuestionnaire, sample_questionnaire_type = sample_questionnaire_type_obj2)

        response = self.client.get(reverse('client_rest_v1:questionnaire_view', kwargs = {
            'questionnaire_type_id': sample_questionnaire_type_obj1.id,
        }))

        expect(response.status_code).to(equal(200))

        expect(response.data['sample_questionnaire_type']).to(equal(sample_questionnaire_type_obj1.id))


    def test_insert_sample_questionnaire_to_audit_cycle(self):
        sample_questionnaire_data = {"questionnaire":[{"id":1,"name":"Entrance","sequence":1,"questions":[{"id":1,"sequence":1,"max_marks":5,"question_txt":"Please Rate Overall Experience. (1 to 5)","question_data":{"options":[{"marks":1,"value":"1","sequence":1},{"marks":2,"value":"2","sequence":2},{"marks":3,"value":"3","sequence":3},{"marks":4,"value":"4","sequence":4},{"marks":5,"value":"5","sequence":5}],"version":1},"question_type":"MUTEX"},{"id":2,"sequence":2,"max_marks":0,"question_txt":"Enter name https://www.example.com", "question_data":{},"question_type":"PLAIN"}]},{"id":2,"name":"Need Analysis","sequence":2,"questions":[{"id":1,"sequence":1,"max_marks":1,"question_txt":"Did the staff greet you upon arrival?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MULTISELECT"},{"id":2,"sequence":2,"max_marks":1,"question_txt":"Did the staff enquire about your purpose of visit?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MUTEX"}]},{"id":3,"name":"Staff Analysis","sequence":3,"questions":[{"id":1,"sequence":1,"max_marks":1,"question_txt":"Did the staff member address you by saying 'Sir' or 'Madam'?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MUTEX"}]},{"id":4,"name":"Selling and Recommendation skills","sequence":4,"questions":[{"id":1,"sequence":1,"max_marks":1,"question_txt":"Did the staff ask for your budget before starting to show products?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MUTEX"}]},{"id":5,"name":"Outlet analysis","sequence":5,"questions":[{"id":1,"sequence":1,"max_marks":1,"question_txt":"Was the outlet neat and clean?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MUTEX"}]}]}

        audit_cycle = mommy.make(AuditCycle, id = 1)
        problem_statement_obj = mommy.make(ProblemStatement, industry = self.industry_obj)
        sample_questionnaire_type_obj = mommy.make(SampleQuestionnaireType, problem_statement = problem_statement_obj)
        sample_questionnaire = mommy.make(SampleQuestionnaire, id=1, questionnaire_data=sample_questionnaire_data, sample_questionnaire_type=sample_questionnaire_type_obj)

        response = self.client.get(reverse('client_rest_v1:sample_questionnaire_insert_view', kwargs = {
            'audit_cycle_id': audit_cycle.id,
            'sample_questionnaire_id': sample_questionnaire.id
        }))

        expect(response.status_code).to(equal(200))

        section_count = Section.objects.all().count()
        question_count = Question.objects.all().count()

        expect(section_count).to(equal(5))
        expect(question_count).to(equal(7))


    def test_import_invalid_sample_questionnaire(self):
        audit_cycle = mommy.make(AuditCycle, id = 1)
        problem_statement_obj = mommy.make(ProblemStatement, industry = self.industry_obj)
        sample_questionnaire_type_obj = mommy.make(SampleQuestionnaireType, problem_statement = problem_statement_obj)
        sample_questionnaire = mommy.make(SampleQuestionnaire, id=1, questionnaire_data={}, sample_questionnaire_type=sample_questionnaire_type_obj)

        with self.assertRaisesRegex(AppLogicError, "Invalid sample questionnaire"):
            insert_sample_questionnaire_to_audit_cycle(audit_cycle.id, sample_questionnaire.id)