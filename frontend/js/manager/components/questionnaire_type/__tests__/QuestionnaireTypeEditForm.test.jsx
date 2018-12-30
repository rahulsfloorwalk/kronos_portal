import React from "react";
import { shallow } from "enzyme";
import $ from "jquery";

import { __QuestionnaireTypeForm } from "../QuestionnaireTypeForm";
import { fetchQuestionnaireType, saveQuestionnaireType } from "../../../service/questionnaire_type.js";
jest.mock("../../../service/questionnaire_type.js");

import QuestionnaireTypeEditForm from "../QuestionnaireTypeEditForm.jsx";

const sampleParams = {
	clientId: "5",
	questionnaireTypeId: "6",
};

const sampleQuestionnaireTypeId = parseInt(sampleParams.questionnaireTypeId);
const sampleClientId = parseInt(sampleParams.clientId);

const sampleQuestionnaireType = {
	id: sampleQuestionnaireTypeId,
	name: "Hello",
	is_default: true,
	client_id: sampleClientId,
};

const sampleErrors =  {
	name: [ "This field is mandatory" ]
};

const formSubmitEvent = { name: "Foobar", is_default: true, };

describe("<QuestionnaireTypeEditForm/>", () => {

	beforeEach(() => {
		fetchQuestionnaireType.mockResolvedValue(sampleQuestionnaireType);
	});

	it("calls fetchQuestionnaireType when form is mounted", () => {
		const sampleRouter = {
			push: jest.fn(),
		};

		shallow(<QuestionnaireTypeEditForm params={sampleParams} router={sampleRouter}/>);
		expect(fetchQuestionnaireType).toHaveBeenCalledTimes(1);
		expect(fetchQuestionnaireType).toBeCalledWith(sampleParams.questionnaireTypeId);
	});

	it("renders nothing while form is being loaded", () => {
		const sampleRouter = {
			push: jest.fn(),
		};

		const r = shallow(<QuestionnaireTypeEditForm params={sampleParams} router={sampleRouter}/>);
		expect(r.getElement()).toBe(null);
	});

	it("sets the form initialValues when the questionnaireType is loaded", (done) => {
		const sampleRouter = {
			push: jest.fn(),
		};
		const r = shallow(<QuestionnaireTypeEditForm params={sampleParams} router={sampleRouter}/>);
		setTimeout(() => {
			r.update();
			expect(r.find(__QuestionnaireTypeForm).prop("initialValues")).toEqual({
				name: sampleQuestionnaireType.name,
				is_default: sampleQuestionnaireType.is_default,
			});
			done();
		});
	});

	describe("when the save is successful", () => {

		beforeEach(() => {
			saveQuestionnaireType.mockReturnValue($.Deferred().resolve(sampleQuestionnaireType).promise());
		});


		it("calls saveQuestionnaireType when form is submitted", (done) => {
			const sampleRouter = {
				push: jest.fn(),
			};

			const r = shallow(<QuestionnaireTypeEditForm params={sampleParams} router={sampleRouter}/>);
			setTimeout(() => {
				r.update();
				r.find(__QuestionnaireTypeForm).simulate("submit", formSubmitEvent);
				expect(saveQuestionnaireType).toBeCalledWith(
					sampleQuestionnaireTypeId,
					formSubmitEvent.name,
					sampleClientId,
					formSubmitEvent.is_default,
				);
				done();
			});
		});

		it("closes the form and navigates to the list when questionnaire type is saved", (done) => {
			const sampleRouter = {
				push: jest.fn(),
			};

			const r = shallow(<QuestionnaireTypeEditForm params={sampleParams} router={sampleRouter}/>);
			setTimeout(() => {
				r.update();
				r.find(__QuestionnaireTypeForm).simulate("submit", formSubmitEvent);

				setTimeout(() => {
					expect(sampleRouter.push).toBeCalledWith("/client/5/questionnaire_type");
					done();
				});
			});
		});

		it("goes back when the form is closed", (done) => {
			const sampleRouter = {
				push: jest.fn(),
				goBack: jest.fn(),
			};

			const r = shallow(<QuestionnaireTypeEditForm params={sampleParams} router={sampleRouter}/>);
			setTimeout(() => {
				r.update();
				r.find(__QuestionnaireTypeForm).simulate("close");
				expect(sampleRouter.goBack).toBeCalled();
				done();
			});
		});
	});

	describe("when the saving fails", () => {
		beforeEach(() => {
			saveQuestionnaireType.mockReturnValue($.Deferred().reject({
				responseJSON: sampleErrors,
			}).promise());
		});

		it("renders the errors when the save fails", (done) => {
			const sampleRouter = {
				push: jest.fn(),
			};

			const r = shallow(<QuestionnaireTypeEditForm params={sampleParams} router={sampleRouter}/>);
			setTimeout(() => {
				r.update();
				r.find(__QuestionnaireTypeForm).simulate("submit", formSubmitEvent);

				setTimeout(() => {
					r.update();
					expect(r.find(__QuestionnaireTypeForm).prop("errors")).toEqual(sampleErrors);
					done();
				});
			});
		});
	});
});

