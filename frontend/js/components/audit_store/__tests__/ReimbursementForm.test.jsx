import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import FormInput from "../../FormInput.jsx";
import ReimbursementForm from "../ReimbursementForm.jsx";

describe("<ReimbursementForm/>", () => {
	const sampleErrors = {
		reimbursement: ["This field is required"],
		non_field_errors: ["I don't think these are the droids you're looking for."],
	};

	let formSubmitEvent, onSubmit, onClose;

	beforeEach(() => {
		onClose = jest.fn(),
		onSubmit = jest.fn(),

		formSubmitEvent = {
			preventDefault: jest.fn(),
		};
	});

	it("is rendered correctly when the form is loading", () => {
		const r = renderer.create(<ReimbursementForm
			loading={true}
			reimbursement={undefined}
			onSubmit={onSubmit}
			onClose={onClose}
			errors={{}}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the earnings per audit pre-filled", () => {
		const r = renderer.create(<ReimbursementForm
			reimbursement={6000}
			loading={false}
			onSubmit={onSubmit}
			onClose={onClose}
			errors={{}}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the errors correctly", () => {
		const r = renderer.create(<ReimbursementForm
			reimbursement={6000}
			loading={false}
			onSubmit={onSubmit}
			onClose={onClose}
			errors={sampleErrors}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("prevents default form action when the form is submitted", () => {
		const r = shallow(<ReimbursementForm
			reimbursement={6000}
			loading={false}
			onSubmit={onSubmit}
			onClose={onClose}
			errors={{}}
		/>);
		r.find(FormInput).simulate("change", { target: { value: "1000" }});
		r.find("form").simulate("submit", formSubmitEvent);
		expect(formSubmitEvent.preventDefault).toBeCalled();
	});

	it("calls onSubmit when the form is submitted", () => {
		const r = shallow(<ReimbursementForm
			reimbursement={6000}
			loading={false}
			onSubmit={onSubmit}
			onClose={onClose}
			errors={{}}
		/>);
		r.find(FormInput).simulate("change", { target: { name: "reimbursement", value: "1000" }});
		r.find("form").simulate("submit", formSubmitEvent);
		expect(onSubmit).toBeCalledWith(1000);
	});

	it("updates the form when the amount is changed", () => {
		const r = shallow(<ReimbursementForm
			reimbursement={6000}
			loading={false}
			onSubmit={onSubmit}
			onClose={onClose}
			errors={{}}
		/>);
		r.find(FormInput).simulate("change", { target: { name: "reimbursement", value: "1000" }});
		expect(r.find(FormInput).prop("value")).toEqual(1000);
	});

	it("calls onClose when modal is closed", () => {
		const r = shallow(<ReimbursementForm
			reimbursement={6000}
			loading={false}
			onSubmit={onSubmit}
			onClose={onClose}
			errors={{}}
		/>);

		r.find("Modal").simulate("close");
		expect(onClose).toHaveBeenCalled();
	});
});
