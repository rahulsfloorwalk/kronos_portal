import types from "../../manager/action_types";
import { rootReducer } from "../../manager/reducers";

describe(types.AUDIT_STORE_ID_QA_OK, () => {
	const sampleAuditStore = {
		id: 5,
	};

	it("it clears the global error on request status", () => {
		const initialState = {
			errors: {
				"foo": "bar",
			},
		};

		const nextState = rootReducer(initialState, {
			type: types.AUDIT_STORE_ID_QA_OK,
			status: "request",
			auditStoreId: 5,
		});

		expect(nextState).toEqual({
			errors: {},
		});
	});
	it("it sets the auditStore on success status", () => {
		const initialState = {};

		const nextState = rootReducer(initialState, {
			type: types.AUDIT_STORE_ID_QA_OK,
			status: "success",
			auditStore: sampleAuditStore,
		});

		expect(nextState).toEqual({
			auditStores: {
				[sampleAuditStore.id]: sampleAuditStore,
			},
		});
	});
	it("it sets the global errors on error status", () => {
		const initialState = {};
		const sampleError = {
			"non_field_errors": ["Report is not complete."],
		};

		const nextState = rootReducer(initialState, {
			type: types.AUDIT_STORE_ID_QA_OK,
			status: "error",
			errors: sampleError,
		});

		expect(nextState).toEqual({
			errors: sampleError,
		});
	});
});

describe(types.AUDIT_STORE_ID_PM_REVERT, () => {
	const sampleAuditStore = {
		id: 5,
	};

	it("it clears the global error on request status", () => {
		const initialState = {
			errors: {
				"foo": "bar",
			},
		};

		const nextState = rootReducer(initialState, {
			type: types.AUDIT_STORE_ID_PM_REVERT,
			status: "request",
			auditStoreId: 5,
		});

		expect(nextState).toEqual({
			errors: {},
		});
	});
	it("it sets the auditStore on success status", () => {
		const initialState = {};

		const nextState = rootReducer(initialState, {
			type: types.AUDIT_STORE_ID_PM_REVERT,
			status: "success",
			auditStore: sampleAuditStore,
		});

		expect(nextState).toEqual({
			auditStores: {
				[sampleAuditStore.id]: sampleAuditStore,
			},
		});
	});
	it("it sets the global errors on error status", () => {
		const initialState = {};
		const sampleError = {
			"non_field_errors": ["Report cannot be PM reverted now."],
		};

		const nextState = rootReducer(initialState, {
			type: types.AUDIT_STORE_ID_PM_REVERT,
			status: "error",
			errors: sampleError,
		});

		expect(nextState).toEqual({
			errors: sampleError,
		});
	});
});

