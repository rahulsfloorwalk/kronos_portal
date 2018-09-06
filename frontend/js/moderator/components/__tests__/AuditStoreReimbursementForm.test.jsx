import React from "react";
import { shallow } from "enzyme";
import $ from "jquery";

import ReimbursementForm from "../../../components/audit_store/ReimbursementForm.jsx";
import AuditStoreReimbursementForm from "../AuditStoreReimbursementForm.jsx";

import { findById, setReimbursement } from "../../service/audit_store";
jest.mock("../../service/audit_store");

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

	let mockRouter;

	beforeEach(() => {
		mockRouter = {
			goBack: jest.fn(),
			push: jest.fn(),
		};
	});

	it("is loading initially", () => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		const r = shallow(<AuditStoreReimbursementForm
			router={mockRouter}
			params={sampleParams}
		/>);
		expect(r.find(ReimbursementForm).prop("loading")).toEqual(true);
	});

	it("calls findById with the correct auditStoreId", () => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		shallow(<AuditStoreReimbursementForm
			router={mockRouter}
			params={sampleParams}
		/>);
		expect(findById).toBeCalledWith(sampleParams.auditStoreId);
	});

	it("disables loading when the auditStore has been loaded", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		const r = shallow(<AuditStoreReimbursementForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.update();
			expect(r.find(ReimbursementForm).prop("loading")).toEqual(false);
			done();
		});
	});

	it("prefills the earnings per audit correctly in the form", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		const r = shallow(<AuditStoreReimbursementForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.update();
			expect(r.find(ReimbursementForm).prop("reimbursement")).toEqual(sampleAuditStore.reimbursement);
			done();
		});
	});

	it("calls setReimbursement when the form is submitted", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		setReimbursement.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreReimbursementForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.find(ReimbursementForm).simulate("submit", 1000);
			expect(setReimbursement).toBeCalledWith(sampleParams.auditStoreId, 1000);
			done();
		});
	});

	it("closes the page when setReimbursement returns successfully", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		setReimbursement.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreReimbursementForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.find(ReimbursementForm).simulate("submit", 1000);
			setTimeout(() => {
				expect(mockRouter.goBack).toBeCalled();
				done();
			});
		});
	});

	it("sets the errors correctly when setReimbursement fails", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		setReimbursement.mockRejectedValue({
			responseJSON: sampleErrors
		});
		const r = shallow(<AuditStoreReimbursementForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.find(ReimbursementForm).simulate("submit", 1000);
			setTimeout(() => {
				r.update();
				expect(r.find(ReimbursementForm).prop("errors")).toEqual(sampleErrors);
				done();
			});
		});
	});
});
