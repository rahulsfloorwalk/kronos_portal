import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import FormInput from "../../../../components/FormInput.jsx";
import { AuditStoreReimbursementForm } from "../AuditStoreReimbursementForm.jsx";

describe("<AuditStoreReimbursementForm/>", () => {
	const sampleParams = {
		auditStoreId: "5",
	};

	const sampleErrors = {
		reimbursement: ["This field is required"],
	};

	const sampleAuditStore = {
		id: 5,
		user: {
			profileinfo: {
				first_name: "John",
				last_name: "Doe",
			}
		},
		audit_date: "2018-09-02",
		earnings_per_audit: 2000,
		reimbursement: 5000,
		status: "PM_REVIEW",
		audit: {
			id: 134,
			earnings_per_audit: 2000,
			reimbursement: 5000,
			audit_cycle: {
				id: 165,
				type: "WALKIN",
			},
			store: {
				id: 123,
				name: "Hello World",
			},
		},
	};

	let mockRouter, formSubmitEvent, onSubmit, loadAuditStore;

	beforeEach(() => {
		loadAuditStore = jest.fn(),
		onSubmit = jest.fn(),

		mockRouter = {
			goBack: jest.fn(),
			push: jest.fn(),
		};

		formSubmitEvent = {
			preventDefault: jest.fn(),
		};
	});

	it("is rendered correctly when the AuditStore is loading", () => {
		const r = renderer.create(<AuditStoreReimbursementForm
			auditStore={undefined}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the earnings per audit pre-filled", () => {
		const r = renderer.create(<AuditStoreReimbursementForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("prevents default form action when the form is submitted", () => {
		onSubmit.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreReimbursementForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);
		r.find(FormInput).simulate("change", { target: { value: "1000" }});
		r.find("form").simulate("submit", formSubmitEvent);
		expect(formSubmitEvent.preventDefault).toBeCalled();
	});

	it("calls onSubmit when the form is submitted", () => {
		onSubmit.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreReimbursementForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);
		r.find(FormInput).simulate("change", { target: { name: "reimbursement", value: "1000" }});
		r.find("form").simulate("submit", formSubmitEvent);
		expect(onSubmit).toBeCalledWith(sampleParams.auditStoreId, "1000");
	});

	it("updates the form when the amount is changed", () => {
		onSubmit.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreReimbursementForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);
		r.find(FormInput).simulate("change", { target: { name: "reimbursement", value: "1000" }});
		expect(r.find(FormInput).prop("value")).toEqual("1000");
	});

	it("closes modal and redirects when the save is successful", (done) => {
		onSubmit.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreReimbursementForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);

		r.find("form").simulate("submit", formSubmitEvent);
		setTimeout(() => {
			expect(mockRouter.push).toBeCalledWith(`/audit_store/${sampleParams.auditStoreId}/report`);
			done();
		});
	});

	it("sets the errors correctly the save fails", (done) => {
		onSubmit.mockRejectedValue({
			responseJSON: sampleErrors,
		});
		const r = shallow(<AuditStoreReimbursementForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);

		r.find("form").simulate("submit", formSubmitEvent);
		setTimeout(() => {
			r.update();
			expect(r.find(FormInput).prop("errors")).toEqual(sampleErrors.reimbursement);
			done();
		});
	});

	it("does not close the modal when the save fails", (done) => {
		onSubmit.mockRejectedValue({
			responseJSON: sampleErrors,
		});
		const r = shallow(<AuditStoreReimbursementForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);

		r.find("form").simulate("submit", formSubmitEvent);
		setTimeout(() => {
			expect(mockRouter.push).not.toHaveBeenCalled();
			done();
		});
	});
});
