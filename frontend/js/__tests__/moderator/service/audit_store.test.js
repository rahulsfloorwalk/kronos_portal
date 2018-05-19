import { findById, rate, complete } from "../../../moderator/service/audit_store";

jest.mock("jquery", () => ({
	ajax: jest.fn(),
	post: jest.fn(),
	get: jest.fn(),
}));

import $ from "jquery";

describe("findById", () => {
	it("calls the audit store url", () => {
		findById(5);
		expect($.get).toBeCalledWith("/moderator/audit_store/5");
	});
});

describe("rate", () => {
	it("calls the qa_rating url", () => {
		rate(5, 2);
		expect($.ajax.mock.calls[0][0].method).toBe("POST");
		expect($.ajax.mock.calls[0][0].contentType).toBe("application/json");
		expect($.ajax.mock.calls[0][0].url).toBe("/moderator/audit_store/5/qa_rating");
		expect($.ajax.mock.calls[0][0].data).toBe("{\"qa_rating\":2}");
	});
});

describe("complete", () => {
	it("calls the complete url", () => {
		complete(5);
		expect($.post).toBeCalledWith("/moderator/audit_store/5/complete");
	});
});
