import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import { QuotationCategoryForm, CustomizeQuotationAlert, QuotationPreview } from "../QuotationDetail.jsx";

import { fetchAuditCategory, fetchAuditType, fetchIndustry, fetchQuotationPreview } from "../../../service/quotation.js";
import FormSelect from "../../../../components/FormSelect.jsx";

jest.mock("../../../service/quotation.js");
jest.mock("react-router", () => ({
	hashHistory: {
		push: jest.fn()
	}
}));

const initialState = {
	client: {
		address: "Japan1",
		company_website_url: "http://www.samsung.com",
		email: "client@samsung.com",
		id: 6,
		logo_url: "",
		name: "Samsung",
		phone: "4562356895",
		receive_email_notification: true
	},
	states: {},
	cities: [],
};

const sampleIndustry = [
	{
		base_rate: 1000,
		id: 1,
		name: "Ecommerce"
	},
	{
		base_rate: 1000,
		id: 2,
		name: "Edtech"
	},
	{
		base_rate: 1000,
		id: 3,
		name: "Fitness"
	},
	{
		base_rate: 1000,
		id: 4,
		name: "Healthcare"
	},
	{
		base_rate: 1000,
		id: 5,
		name: "Online Services"
	},
	{
		base_rate: 1000,
		id: 6,
		name: "Electronics & Appliances"
	},
	{
		base_rate: 1000,
		id: 7,
		name: "Entertainment"
	},
	{
		base_rate: 1000,
		id: 8,
		name: "Jewellery"
	},
	{
		base_rate: 1000,
		id: 9,
		name: "Academics"
	},
	{
		base_rate: 1000,
		id: 10,
		name: "Banking/Finance"
	},
	{
		base_rate: 1000,
		id: 11,
		name: "Food and Beverages"
	},
	{
		base_rate: 1000,
		id: 12,
		name: "Construction/Inter"
	},
	{
		base_rate: 1000,
		id: 13,
		name: "Real Estate"
	},
	{
		base_rate: 1000,
		id: 14,
		name: "Salons & Spa"
	},
	{
		base_rate: 1000,
		id: 15,
		name: "Hospitality"
	},
	{
		base_rate: 1000,
		id: 16,
		name: "Automobile"
	},
	{
		base_rate: 1000,
		id: 17,
		name: "Co-Working Spaces"
	},
	{
		base_rate: 1000,
		id: 18,
		name: "Other"
	}
];
const sampleAuditType = [
	{id: 1, markup: 40, name: "Mystery Audit - Walk-in"},
	{id: 2, markup: 20, name: "Mystery Audit -Telephonic"},
	{id: 3, markup: 25, name: "Online Audits"},
	{id: 4, markup: 30, name: "Informed Audit - Walk-in"},
	{id: 5, markup: 15, name: "product sample"},
	{id: 6, markup: 0, name: "Other"}
];
const sampleAuditCategory = [
	{id: 1, markup: 30, name: "Consumer Experience - Product"},
	{id: 2, markup: 30, name: "Consumer Experience - Service"},
	{id: 3, markup: 20, name: "Consumer insights"},
	{id: 4, markup: 20, name: "Franchisee Performance"},
	{id: 5, markup: 25, name: "Integrity Study"},
	{id: 6, markup: 30, name: "Market Operating Price"},
	{id: 7, markup: 25, name: "Market Research"},
	{id: 8, markup: 25, name: "Operational Audits"},
	{id: 9, markup: 15, name: "Operational Audits"},
	{id: 10, markup: 40, name: "Inventory Audit"},
	{id: 11, markup: 20, name: "Revenue Leakage"},
	{id: 12, markup: 30, name: "Sales Process"},
	{id: 13, markup: 20, name: "Visual Merchandising"},
	{id: 14, markup: 0, name: "Other"},
];


describe("<QuotationCategoryForm/>", () => {

	beforeEach(() => {
		fetchIndustry.mockResolvedValue(sampleIndustry);
		fetchAuditType.mockResolvedValue(sampleAuditType);
		fetchAuditCategory.mockResolvedValue(sampleAuditCategory);
	});

	it("calls fetchAuditCategory", () => {
		const onSubmit = jest.fn();
		const wrapper = shallow(
			<QuotationCategoryForm stepComplete={false} onQuotationChange={onSubmit}/>
		);
		wrapper.setState({ loading: false });
		expect(wrapper.find(FormSelect)).toHaveLength(3);
		expect(wrapper.find("button")).toHaveLength(1);
	});

	it("should change the all category state", (done) => {
		const onSubmit = jest.fn();
		const wrapper = shallow(
			<QuotationCategoryForm stepComplete={false} onQuotationChange={onSubmit}/>
		);
		wrapper.setState({ loading: false });

		wrapper.find(FormSelect).at(0).simulate("change",
			{ target: { name: "industry_category", value: "1" } }
		);

		wrapper.update();
		setTimeout(() => {
			expect(wrapper.state("industry_category")).toEqual("1");
			done();
		});
	});

	it("validate submit function without data", (done) => {
		jest.spyOn(window, "alert").mockImplementation(() => {});
		const onSubmit = jest.fn();
		const wrapper = shallow(
			<QuotationCategoryForm stepComplete={false} onQuotationChange={onSubmit}/>
		);
		wrapper.setState({
			loading: false,
		});
		wrapper.find("button").simulate("click");
		setTimeout(() => {
			expect(window.alert.mock.calls.length).toBe(1);
			done();
		});
	});

	it("validate submit function", (done) => {
		const onSubmit = jest.fn();
		const wrapper = shallow(
			<QuotationCategoryForm stepComplete={false} onQuotationChange={onSubmit}/>
		);
		wrapper.setState({
			loading: false,
			industry: "1",
			problemStatement: "1",
			sampleQuestionnaireType: "1",
		});
		wrapper.find("button").simulate("click");
		setTimeout(() => {
			expect(onSubmit).toHaveBeenCalled();
			done();
		});
	});

	it("calls customize audit link", () => {
		const mockRouter = {
			push: jest.fn(),
		};
		const onSubmit = jest.fn();
		const wrapper = shallow(
			<QuotationCategoryForm stepComplete={false} onQuotationChange={onSubmit} router={mockRouter}/>
		);
		wrapper.setState({
			loading: false,
			industry: "18",
			problemStatement: "5",
			sampleQuestionnaireType: "2",
			customize_alert: false,
		});
		wrapper.find("button").simulate("click");
		wrapper.update();
		expect(wrapper.state("customize_alert")).toEqual(true);

		wrapper.setState({
			loading: false,
			industry: "1",
			problemStatement: "6",
			sampleQuestionnaireType: "4",
			customize_alert: false,
		});
		wrapper.find("button").simulate("click");
		wrapper.update();
		expect(wrapper.state("customize_alert")).toEqual(true);

		wrapper.setState({
			loading: false,
			industry: "8",
			problemStatement: "3",
			sampleQuestionnaireType: "14",
			customize_alert: false,
		});
		wrapper.find("button").simulate("click");
		wrapper.update();
		expect(wrapper.state("customize_alert")).toEqual(true);
	});
});

describe("<CustomizeQuotationAlert/>", () => {
	it("renders the customize quotation alert", ()=>{
		const r = renderer.create(<CustomizeQuotationAlert/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});

describe("<QuotationPreview/>", ()=>{

	it("renders the empty quotation", ()=>{
		const quotation = {
			industry: "3",
			problemStatement: "3",
			sampleQuestionnaireType: "5",
			profile: {
				gender: [],
				education: [],
				income: [],
				car_cost: [],
				occupation: [],
				interest_area: [],
				marital_status: [],
				report_rating: [],
				auditor_rating: [],
				date_availability: ""
			},
			selectedCities: [
				{
					id: 685,
					name: "Mangolpuri",
					tier: 3,
					audit_count: "1"
				}
			]
		};
		const quotation_preview = {
			industry: {
				id: 3,
				name: "Fitness"
			},
			problem_statement: {
				id: 3,
				name: "Online Audits"
			},
			sample_questionnaire_type: {
				id: 5,
				name: "Integrity Study"
			},
			audit_locations: [{
				audit_count: "1",
				audit_fee: 1900,
				id: 685,
				name: "Mangolpuri",
				tier: 3
			}],
			quotation_fee: 1900,
			gst_amount: 342,
			gst: "18",
			discount: 0,
			payable_amount: 2242
		};
		const stepComplete = false;
		const clientId = initialState.client.id;
		const prevStep = jest.fn();
		const openPaymentForm = jest.fn();
		const onSubmit = jest.fn();

		fetchQuotationPreview.mockResolvedValue(quotation_preview);

		const r = renderer.create(<QuotationPreview quotation={quotation} stepComplete={stepComplete} clientId={clientId} prevStep={prevStep} openPaymentForm={openPaymentForm} onQuotationChange={onSubmit} />);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the quotation", (done)=>{
		const quotation = {
			industry: "3",
			problemStatement: "3",
			sampleQuestionnaireType: "5",
			profile: {
				gender: [],
				education: [],
				income: [],
				car_cost: [],
				occupation: [],
				interest_area: [],
				marital_status: [],
				report_rating: [],
				auditor_rating: [],
				date_availability: ""
			},
			selectedCities: [
				{
					id: 685,
					name: "Mangolpuri",
					tier: 3,
					audit_count: "1"
				}
			]
		};

		const quotation_preview = {
			industry: {
				id: 3,
				name: "Fitness"
			},
			problem_statement: {
				id: 3,
				name: "Online Audits"
			},
			sample_questionnaire_type: {
				id: 5,
				name: "Integrity Study"
			},
			audit_locations: [{
				audit_count: "1",
				audit_fee: 1900,
				id: 685,
				name: "Mangolpuri",
				tier: 3
			}],
			quotation_fee: 1900,
			gst_amount: 342,
			gst: "18",
			discount: 0,
			payable_amount: 2242
		};
		const stepComplete = false;
		const clientId = initialState.client.id;
		const prevStep = jest.fn();
		const openPaymentForm = jest.fn();
		const onQuotationChange = jest.fn();

		fetchQuotationPreview.mockResolvedValue(quotation_preview);

		const r = renderer.create(<QuotationPreview quotation={quotation} stepComplete={stepComplete} clientId={clientId} prevStep={prevStep} openPaymentForm={openPaymentForm} onQuotationChange={onQuotationChange} />);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});