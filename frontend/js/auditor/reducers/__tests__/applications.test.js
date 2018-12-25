
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.APPLICATION_GET, () => {
	const actionType = types.APPLICATION_GET;

	describe("when status is success", () => {
		const sampleApplications = [
			{
				id: 1,
				audit_id: 2,
				user_id: 3,
			}, {
				id: 2,
				audit_id: 2,
				user_id: 3,
			},
		];

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				applications: sampleApplications,
			});
		});

		it("converts the list to an object", () => {
			expect(nextState.applications).toEqual({
				[sampleApplications[0].id]: sampleApplications[0],
				[sampleApplications[1].id]: sampleApplications[1],
			});
		});
	});
});

describe(types.AUDIT_APPLY_FORM_LOAD, () => {
	const actionType = types.AUDIT_APPLY_FORM_LOAD;

	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("clears the form errros", () => {
			expect(nextState.forms.auditApply.errors).toEqual({});
		});
	});
});

describe(types.AUDIT_APPLY_FORM_SUB, () => {
	const actionType = types.AUDIT_APPLY_FORM_SUB;

	describe("when status is success", () => {
		const sampleApplication = {
			id: 1,
			audit_id: 2,
			user_id: 3,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				auditApplication: sampleApplication,
			});
		});

		it("sets the application at the correct id", () => {
			expect(nextState.applications[sampleApplication.id]).toEqual(sampleApplication);
		});
	});

	describe("when status is error", () => {
		const sampleErrors = {
			audit_date: ["This field is mandatory."],
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "error",
				errors: sampleErrors,
			});
		});

		it("sets the form errros", () => {
			expect(nextState.forms.auditApply.errors).toEqual(sampleErrors);
		});
	});
});

describe(types.AUDIT_CANCEL_FORM_LOAD, () => {
	const actionType = types.AUDIT_CANCEL_FORM_LOAD;

	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("clears the form errros", () => {
			expect(nextState.forms.auditCancel.errors).toEqual({});
		});
	});
});

describe(types.AUDIT_CANCEL_FORM_SUB, () => {
	const actionType = types.AUDIT_CANCEL_FORM_SUB;

	describe("when status is success", () => {
		const sampleApplication = {
			id: 1,
			audit_id: 2,
			user_id: 3,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				auditApplication: sampleApplication,
			});
		});

		it("sets the application at the correct id", () => {
			expect(nextState.applications[sampleApplication.id]).toEqual(sampleApplication);
		});
	});

	describe("when status is error", () => {
		const sampleErrors = {
			audit_date: ["This field is mandatory."],
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "error",
				errors: sampleErrors,
			});
		});

		it("sets the form errros", () => {
			expect(nextState.forms.auditCancel.errors).toEqual(sampleErrors);
		});
	});
});
