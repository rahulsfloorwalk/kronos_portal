import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import FormInput from "../../../../components/FormInput.jsx";
import { FailReportMessageForm } from "../FailReportMessageForm.jsx";

describe("<FailReportMessageForm/>", () => {
	const sampleParams = {
		auditStoreId: "5",
		message: "Report Failed for testing",
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
		const r = renderer.create(<FailReportMessageForm
			auditStore={undefined}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the failure message pre-filled", () => {
		const r = renderer.create(<FailReportMessageForm
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
		const r = shallow(<FailReportMessageForm
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
		const r = shallow(<FailReportMessageForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);
		r.find(FormInput).simulate("change", { target: { name: "message", value: "This is test message" }});
		r.find("form").simulate("submit", formSubmitEvent);
		expect(onSubmit).toBeCalledWith(sampleParams.auditStoreId, "This is test message");
	});

	it("updates the form when the message is changed", () => {
		onSubmit.mockResolvedValue(sampleAuditStore);
		const r = shallow(<FailReportMessageForm
			auditStore={sampleAuditStore}
			loadAuditStore={loadAuditStore}
			onSubmit={onSubmit}
			router={mockRouter}
			params={sampleParams}
		/>);
		r.find(FormInput).simulate("change", { target: { name: "message", value: "This is test message" }});
		expect(r.find(FormInput).prop("value")).toEqual("This is test message");
	});

	it("closes modal and redirects when report is failed successful", (done) => {
		onSubmit.mockResolvedValue(sampleAuditStore);
		const r = shallow(<FailReportMessageForm
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
});
