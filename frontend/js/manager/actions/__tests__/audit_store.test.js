import { qaOkAuditStore, pmRevertAuditStore, acceptAuditStore, setReportAttributeValue, setReportSummary } from "../../../manager/actions/audit_store";
import types from "../../../manager/action_types";
import * as service from "../../service/audit_store";

jest.mock("../../service/audit_store");

jest.mock("jquery", () => ({
	ajax: jest.fn(),
	post: jest.fn(),
}));

import $ from "jquery";

describe("qaOkAuditStore", () => {
	const sampleAuditStore = {
		id: 5,
	};
	it("it dispatches a request before posting to the URL", () => {
		const dispatch = jest.fn();
		const thunk = qaOkAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		expect(dispatch).toBeCalledWith({
			type: types.AUDIT_STORE_ID_QA_OK,
			status: "request",
			auditStoreId: sampleAuditStore.id,
		});
	});
	it("it posts to the correct URL", () => {
		const dispatch = jest.fn();
		const thunk = qaOkAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		expect($.post).toBeCalledWith("/manager/audit_store/5/qa_ok");
	});
	it("it dispatches a success action when server returns successfully", (done) => {
		const dispatch = jest.fn();
		const thunk = qaOkAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.AUDIT_STORE_ID_QA_OK,
				status: "success",
				auditStore: sampleAuditStore,
			});
			done();
		});
	});
	it("it dispatches an error action when there is a client error", (done) => {
		const dispatch = jest.fn();
		const thunk = qaOkAuditStore(sampleAuditStore.id);
		const sampleServerError = {
			"non_field_errors": ["Report is not complete."],
		};

		$.post.mockRejectedValue({
			responseJSON: sampleServerError,
		});

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.AUDIT_STORE_ID_QA_OK,
				status: "error",
				errors: sampleServerError,
			});
			done();
		});
	});
});

describe("pmRevertAuditStore", () => {
	const sampleAuditStore = {
		id: 5,
	};
	it("it dispatches a request before posting to the URL", () => {
		const dispatch = jest.fn();
		const thunk = pmRevertAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		expect(dispatch).toBeCalledWith({
			type: types.AUDIT_STORE_ID_PM_REVERT,
			status: "request",
			auditStoreId: sampleAuditStore.id,
		});
	});
	it("it posts to the correct URL", () => {
		const dispatch = jest.fn();
		const thunk = pmRevertAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		expect($.post).toBeCalledWith("/manager/audit_store/5/pm_revert");
	});
	it("it dispatches a success action when server returns successfully", (done) => {
		const dispatch = jest.fn();
		const thunk = pmRevertAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.AUDIT_STORE_ID_PM_REVERT,
				status: "success",
				auditStore: sampleAuditStore,
			});
			done();
		});
	});
	it("it dispatches an error action when there is a client error", (done) => {
		const dispatch = jest.fn();
		const thunk = pmRevertAuditStore(sampleAuditStore.id);
		const sampleServerError = {
			"non_field_errors": ["Report cannot be reverted to QA now."],
		};

		$.post.mockRejectedValue({
			responseJSON: sampleServerError,
		});

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.AUDIT_STORE_ID_PM_REVERT,
				status: "error",
				errors: sampleServerError,
			});
			done();
		});
	});
});

describe("acceptAuditStore", () => {
	const sampleAuditStore = {
		id: 5,
	};
	it("it dispatches a request before posting to the URL", () => {
		const dispatch = jest.fn();
		const thunk = acceptAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		expect(dispatch).toBeCalledWith({
			type: types.AUDIT_STORE_ID_ACCEPT,
			status: "request",
			auditStoreId: sampleAuditStore.id,
		});
	});
	it("it posts to the correct URL", () => {
		const dispatch = jest.fn();
		const thunk = acceptAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		expect($.post).toBeCalledWith("/manager/audit_store/5/accept");
	});
	it("it dispatches a success action when server returns successfully", (done) => {
		const dispatch = jest.fn();
		const thunk = acceptAuditStore(sampleAuditStore.id);

		$.post.mockResolvedValue(sampleAuditStore);

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.AUDIT_STORE_ID_ACCEPT,
				status: "success",
				auditStore: sampleAuditStore,
			});
			done();
		});
	});
	it("it dispatches an error action when there is a client error", (done) => {
		const dispatch = jest.fn();
		const thunk = acceptAuditStore(sampleAuditStore.id);
		const sampleServerError = {
			"non_field_errors": ["Report cannot be accepted now."],
		};

		$.post.mockRejectedValue({
			responseJSON: sampleServerError,
		});

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.AUDIT_STORE_ID_ACCEPT,
				status: "error",
				errors: sampleServerError,
			});
			done();
		});
	});
});

describe(setReportAttributeValue, () => {
	const sampleAuditStore = {
		id: 5,
		audit_date: "2018-07-02",
	};
	it("returns a thunk that calls the service with the audit store id, json id and option id", () => {
		service.setReportAttributeValue.mockResolvedValue(sampleAuditStore);
		const dispatch = jest.fn();
		const sampleJsonId = "foobar1";
		const sampleOptionId = "opt1";

		const thunk = setReportAttributeValue(sampleAuditStore.id, sampleJsonId, sampleOptionId);
		thunk(dispatch);

		expect(service.setReportAttributeValue).toBeCalledWith(sampleAuditStore.id, sampleJsonId, sampleOptionId);
	});
	it("dispatches an action when server returns an updated audit store successfully", (done) => {
		service.setReportAttributeValue.mockResolvedValue(sampleAuditStore);
		const dispatch = jest.fn();
		const sampleJsonId = "foobar1";
		const sampleOptionId = "opt1";

		const thunk = setReportAttributeValue(sampleAuditStore.id, sampleJsonId, sampleOptionId);
		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.AUDIT_STORE_UPDATED,
				status: "success",
				auditStore: sampleAuditStore,
			});
			done();
		});
	});
});

describe("setReportSummary", () => {
	const sampleAuditStore = {
		id: 5,
		audit_date: "2018-07-02",
		report_summary: "Audit was completed successfully",
	};
	it("returns a thunk that calls the service with the audit store id, json id and option id", () => {
		service.setReportSummary.mockResolvedValue(sampleAuditStore);
		const dispatch = jest.fn();
		const reportSummary = "Audit was completed successfully";

		const thunk = setReportSummary(sampleAuditStore.id, reportSummary);
		thunk(dispatch);

		expect(service.setReportSummary).toBeCalledWith(sampleAuditStore.id, reportSummary);
	});
	it("dispatches an action when server returns an updated audit store successfully", (done) => {
		service.setReportSummary.mockResolvedValue(sampleAuditStore);
		const dispatch = jest.fn();
		const reportSummary = "Audit was completed successfully";

		const thunk = setReportSummary(sampleAuditStore.id, reportSummary);
		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.AUDIT_STORE_UPDATED,
				status: "success",
				auditStore: sampleAuditStore,
			});
			done();
		});
	});
});

