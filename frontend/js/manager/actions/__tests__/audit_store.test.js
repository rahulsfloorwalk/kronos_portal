import { qaOkAuditStore, pmRevertAuditStore, acceptAuditStore } from "../../../manager/actions/audit_store";
import types from "../../../manager/action_types";

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

