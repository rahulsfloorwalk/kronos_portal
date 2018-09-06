import React from "react";
import { shallow } from "enzyme";
import $ from "jquery";

import EarningsPerAuditForm from "../../../components/audit_store/EarningsPerAuditForm.jsx";
import AuditStoreEarningsPerAuditForm from "../AuditStoreEarningsPerAuditForm.jsx";

import { findById, setEarningsPerAudit } from "../../service/audit_store";
jest.mock("../../service/audit_store");

describe("<AuditStoreEarningsPerAuditForm/>", () => {
	const sampleParams = {
		auditStoreId: "5",
	};

	const sampleErrors = {
		earnings_per_audit: ["This field is required"],
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
		const r = shallow(<AuditStoreEarningsPerAuditForm
			router={mockRouter}
			params={sampleParams}
		/>);
		expect(r.find(EarningsPerAuditForm).prop("loading")).toEqual(true);
	});

	it("calls findById with the correct auditStoreId", () => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		shallow(<AuditStoreEarningsPerAuditForm
			router={mockRouter}
			params={sampleParams}
		/>);
		expect(findById).toBeCalledWith(sampleParams.auditStoreId);
	});

	it("disables loading when the auditStore has been loaded", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		const r = shallow(<AuditStoreEarningsPerAuditForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.update();
			expect(r.find(EarningsPerAuditForm).prop("loading")).toEqual(false);
			done();
		});
	});

	it("prefills the earnings per audit correctly in the form", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		const r = shallow(<AuditStoreEarningsPerAuditForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.update();
			expect(r.find(EarningsPerAuditForm).prop("earningsPerAudit")).toEqual(sampleAuditStore.earnings_per_audit);
			done();
		});
	});

	it("calls setEarningsPerAudit when the form is submitted", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		setEarningsPerAudit.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreEarningsPerAuditForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.find(EarningsPerAuditForm).simulate("submit", 1000);
			expect(setEarningsPerAudit).toBeCalledWith(sampleParams.auditStoreId, 1000);
			done();
		});
	});

	it("closes the page when setEarningsPerAudit returns successfully", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		setEarningsPerAudit.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreEarningsPerAuditForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.find(EarningsPerAuditForm).simulate("submit", 1000);
			setTimeout(() => {
				expect(mockRouter.goBack).toBeCalled();
				done();
			});
		});
	});

	it("sets the errors correctly when setEarningsPerAudit fails", (done) => {
		findById.mockReturnValue($.Deferred().resolve(sampleAuditStore));
		setEarningsPerAudit.mockRejectedValue({
			responseJSON: sampleErrors
		});
		const r = shallow(<AuditStoreEarningsPerAuditForm
			router={mockRouter}
			params={sampleParams}
		/>);
		setTimeout(() => {
			r.find(EarningsPerAuditForm).simulate("submit", 1000);
			setTimeout(() => {
				r.update();
				expect(r.find(EarningsPerAuditForm).prop("errors")).toEqual(sampleErrors);
				done();
			});
		});
	});
});
