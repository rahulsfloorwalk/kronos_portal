import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import QuestionnaireTypeForm, { __QuestionnaireTypeForm } from "../QuestionnaireTypeForm";
import { createQuestionnaireType } from "../../../service/questionnaire_type.js";

jest.mock("../../../service/questionnaire_type.js");

const sampleParams = {
	clientId: "5",
};

const sampleClientId = parseInt(sampleParams.clientId);

const sampleQuestionnaireType = {
	id: 6,
	name: "Hello",
	is_default: true,
};

const sampleErrors =  {
	name: [ "This field is mandatory" ]
};

describe("<__QuestionnaireTypeForm/>", () => {
	it("renders correctly", () => {
		const tree = renderer
			.create(<__QuestionnaireTypeForm/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders initial values correctly", () => {
		const initialValues = {
			name: "Foobar",
			is_default: true,
		};

		const tree = renderer
			.create(<__QuestionnaireTypeForm initialValues={initialValues}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("calls onSubmit prop when save button is clicked", () => {
		const onSubmitCallback = jest.fn();
		const formSubmitEvent = { preventDefault: jest.fn() };

		const r = shallow(<__QuestionnaireTypeForm onSubmit={onSubmitCallback}/>);
		r.find("form").simulate("submit", formSubmitEvent);
		expect(formSubmitEvent.preventDefault).toBeCalled();
		expect(onSubmitCallback).toBeCalled();
	});

	it("calls onSubmit prop with correct name and is_default", () => {
		const inputChangeEvent = { target: { name: "name", value: "Foobar", }, };
		const checkboxChangeEvent = true;
		const formSubmitEvent = { preventDefault: jest.fn() };

		const onSubmitCallback = jest.fn();
		const r = shallow(<__QuestionnaireTypeForm onSubmit={onSubmitCallback}/>);
		r.find("QuestionnaireTypeFormSelect").simulate("change", inputChangeEvent);
		r.find("Checkbox").simulate("change", checkboxChangeEvent);
		r.find("form").simulate("submit", formSubmitEvent);

		expect(formSubmitEvent.preventDefault).toBeCalled();
		expect(onSubmitCallback).toBeCalledWith({
			name: "Foobar",
			is_default: checkboxChangeEvent,
		});
	});

	it("calls onClose prop when Modal close button is clicked", () => {
		const onCloseCallback = jest.fn();
		const r = shallow(<__QuestionnaireTypeForm onClose={onCloseCallback}/>);
		r.find("Modal").simulate("close");
		expect(onCloseCallback).toBeCalled();
	});
});

describe("<QuestionnaireTypeForm/>", () => {

	describe("when the save is successful", () => {

		beforeEach(() => {
			createQuestionnaireType.mockReturnValue($.Deferred().resolve(sampleQuestionnaireType).promise());
		});

		it("calls createQuestionnaireType when form is submitted", () => {
			const sampleRouter = {
				push: jest.fn(),
			};

			const formSubmitEvent = { name: "Foobar", is_default: true, };

			const r = shallow(<QuestionnaireTypeForm params={sampleParams} router={sampleRouter}/>);
			r.find(__QuestionnaireTypeForm).simulate("submit", formSubmitEvent);
			expect(createQuestionnaireType).toBeCalledWith(
				formSubmitEvent.name,
				sampleClientId,
				formSubmitEvent.is_default,
			);
		});

		it("closes the form and navigates to list when questionnaire type is created", (done) => {
			const sampleRouter = {
				push: jest.fn(),
			};

			const formSubmitEvent = { name: "Foobar", is_default: true, };

			const r = shallow(<QuestionnaireTypeForm params={sampleParams} router={sampleRouter}/>);
			r.find(__QuestionnaireTypeForm).simulate("submit", formSubmitEvent);

			setTimeout(() => {
				expect(sampleRouter.push).toBeCalledWith("/projects/5/questionnaire_type");
				done();
			});
		});

		it("goes back when the form is closed", () => {
			const sampleRouter = {
				push: jest.fn(),
				goBack: jest.fn(),
			};

			const r = shallow(<QuestionnaireTypeForm params={sampleParams} router={sampleRouter}/>);
			r.find(__QuestionnaireTypeForm).simulate("close");
			expect(sampleRouter.goBack).toBeCalled();
		});
	});

	describe("when the saving fails", () => {
		beforeEach(() => {
			createQuestionnaireType.mockReturnValue($.Deferred().reject({
				responseJSON: sampleErrors,
			}).promise());
		});

		it("renders the errors when the save fails", (done) => {
			const sampleRouter = {
				push: jest.fn(),
			};

			const formSubmitEvent = { name: "Foobar", is_default: true, };

			const r = shallow(<QuestionnaireTypeForm params={sampleParams} router={sampleRouter}/>);
			r.find(__QuestionnaireTypeForm).simulate("submit", formSubmitEvent);

			setTimeout(() => {
				r.update();
				expect(r.find(__QuestionnaireTypeForm).prop("errors")).toEqual(sampleErrors);
				done();
			});
		});
	});
});

