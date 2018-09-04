import { rate, setReimbursement, setEarningsPerAudit } from "../../../manager/service/audit_store";

jest.mock("jquery", () => ({
	ajax: jest.fn(),
	post: jest.fn(),
}));

import $ from "jquery";

describe("rate", () => {
	it("calls the qa_rating url", () => {
		rate(5, 2);
		expect($.ajax.mock.calls[0][0].method).toBe("POST");
		expect($.ajax.mock.calls[0][0].contentType).toBe("application/json");
		expect($.ajax.mock.calls[0][0].url).toBe("/manager/audit_store/5/qa_rating");
		expect($.ajax.mock.calls[0][0].data).toBe("{\"qa_rating\":2}");
	});
});

describe("setReimbursement", () => {
	it("calls the url to set the reimbursement for a report", () => {
		setReimbursement(5, 5000);
		expect($.ajax.mock.calls[0][0].method).toBe("POST");
		expect($.ajax.mock.calls[0][0].contentType).toBe("application/json");
		expect($.ajax.mock.calls[0][0].url).toBe("/manager/audit_store/5/reimbursement");
		expect($.ajax.mock.calls[0][0].data).toBe("{\"reimbursement\":5000}");
	});
});

describe("setEarningsPerAudit", () => {
	it("calls the url to set the reimbursement for a report", () => {
		setEarningsPerAudit(5, 2000);
		expect($.ajax.mock.calls[0][0].method).toBe("POST");
		expect($.ajax.mock.calls[0][0].contentType).toBe("application/json");
		expect($.ajax.mock.calls[0][0].url).toBe("/manager/audit_store/5/earnings_per_audit");
		expect($.ajax.mock.calls[0][0].data).toBe("{\"earnings_per_audit\":2000}");
	});
});
