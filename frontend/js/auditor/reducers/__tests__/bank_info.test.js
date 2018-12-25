
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.BANK_INFO_GET, () => {
	const actionType = types.BANK_INFO_GET;
	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("sets loading to true", () => {
			expect(nextState.loadingBankInfo).toEqual(true);
		});
	});

	describe("when status is success", () => {
		const sampleBankInfo = {
			id: 1,
			user_id: 1,
			ifsc_code: "SBIN00012314",
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				bankInfo: sampleBankInfo,
			});
		});

		it("sets loading to false", () => {
			expect(nextState.loadingBankInfo).toEqual(false);
		});

		it("sets the bank info", () => {
			expect(nextState.bankInfo).toEqual(sampleBankInfo);
		});
	});
});

describe(types.BANK_INFO_POST, () => {
	const actionType = types.BANK_INFO_POST;

	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.bankInfo.errors).toEqual({});
		});
	});

	describe("when status is success", () => {
		const sampleBankInfo = {
			id: 1,
			user_id: 1,
			ifsc_code: "SBIN00012314",
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				bankInfo: sampleBankInfo,
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.bankInfo.errors).toEqual({});
		});

		it("sets the bank info", () => {
			expect(nextState.bankInfo).toEqual(sampleBankInfo);
		});
	});

	describe("when status is error", () => {
		const sampleErrors = {
			ifsc_code: ["This field is mandatory."],
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "error",
				errors: sampleErrors,
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.bankInfo.errors).toEqual(sampleErrors);
		});
	});
});
