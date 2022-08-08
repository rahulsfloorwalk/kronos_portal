from django.urls import reverse
from faker import Faker
from model_mommy import mommy

from expects import expect, equal
from .utils import ClientAPITestCase

from questionnaire.models.questionnaire import Industry, ProblemStatement, SampleQuestionnaireType

fake = Faker()

class QuotationTestCase(ClientAPITestCase):

    def setUp(self):
        super(QuotationTestCase, self).setUp()
        self.login()

    def test_get_retrieves_quotation_industry(self):
        response = self.client.get(reverse('client_rest_v1:industry_quotation_view'))
        expect(response.status_code).to(equal(200))
        expect(len(response.data)).to(equal(18))

    def test_get_retrieves_quotation_audit_category(self):
        response = self.client.get(reverse('client_rest_v1:audit_category_quotation_view'))
        expect(response.status_code).to(equal(200))
        expect(len(response.data)).to(equal(14))

    def test_get_retrieves_quotation_audit_type(self):
        response = self.client.get(reverse('client_rest_v1:audit_type_quotation_view'))
        expect(response.status_code).to(equal(200))
        expect(len(response.data)).to(equal(6))

    def test_get_retrieves_quotation_preview(self):
        self.maxDiff = None
        industry = mommy.make(Industry, id=10, name="Banking/Finance", base_rate=1000)
        problem_statement = mommy.make(ProblemStatement, id=2, industry=industry, name="Mystery Audit -Telephonic", markup=20)
        mommy.make(SampleQuestionnaireType, id=3, problem_statement=problem_statement, name="Consumer insights", markup=20)
        quotation_data = {
            "industry": "10",
            "problem_statement": "2",
            "sample_questionnaire_type": "3",
            "audit_locations": [
                {
                    "id": 138,
                    "name": "Goa North",
                    "tier": "3",
                    "audit_count": 2
                },
                {
                    "id": 686,
                    "name": "Margao",
                    "tier": "3",
                    "audit_count": 1
                }
            ],
            "auditor_profile":{
                'auditor_rating':[],
                'car_cost': [],
                'date_availability':"",
                'education': [],
                'gender': ["M", "F"],
                'income': [],
                'interest_area': [],
                'marital_status': [],
                'occupation': [],
                'report_rating': []
            },
            "quotation_fee": 5400,
            "discount": 0,
            "gst": "18",
            "gst_amount": 972,
            "payable_amount": 6372
        }
        response_data = {
            "industry": {
                "id": 10,
                "name": "Banking/Finance"
            },
            "problem_statement": {
                "id": 2,
                "name": "Mystery Audit -Telephonic"
            },
            "sample_questionnaire_type": {
                "id": 3,
                "name": "Consumer insights"
            },
            "audit_locations": [
                {
                    "id": 138,
                    "name": "Goa North",
                    "tier": "3",
                    "audit_count": 2,
                    "audit_fee": 3600
                },
                {
                    "id": 686,
                    "name": "Margao",
                    "tier": "3",
                    "audit_count": 1,
                    "audit_fee": 1800
                }
            ],
            "quotation_fee": 5400,
            "discount": 0,
            "gst": 18,
            "gst_amount": 972,
            "payable_amount": 6372
        }
        response = self.client.post(reverse('client_rest_v1:quotation_preview_view'), quotation_data, format="json")
        expect(response.status_code).to(equal(200))
        self.assertDictEqual(response.data, response_data)