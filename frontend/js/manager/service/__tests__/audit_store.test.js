import { rate } from "../../../manager/service/audit_store";

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
