
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.ADDITIONAL_INFO_GET, () => {
	const actionType = types.ADDITIONAL_INFO_GET;
	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("sets loading to true", () => {
			expect(nextState.loadingAdditionalInfo).toEqual(true);
		});
	});

	describe("when status is success", () => {
		const sampleAdditionalInfo = {
			id: 1,
			user_id: 1,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				additionalInfo: sampleAdditionalInfo,
			});
		});

		it("sets loading to false", () => {
			expect(nextState.loadingAdditionalInfo).toEqual(false);
		});

		it("sets the additional info", () => {
			expect(nextState.additionalInfo).toEqual(sampleAdditionalInfo);
		});
	});
});

describe(types.ADDITIONAL_INFO_POST, () => {
	const actionType = types.ADDITIONAL_INFO_POST;

	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.additionalInfo.errors).toEqual({});
		});
	});

	describe("when status is success", () => {
		const sampleAdditionalInfo = {
			id: 1,
			user_id: 1,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				additionalInfo: sampleAdditionalInfo,
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.additionalInfo.errors).toEqual({});
		});

		it("sets the additional info", () => {
			expect(nextState.additionalInfo).toEqual(sampleAdditionalInfo);
		});
	});

	describe("when status is error", () => {
		const sampleErrors = {
			referral_code: ["This field is mandatory."],
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
			expect(nextState.forms.additionalInfo.errors).toEqual(sampleErrors);
		});
	});
});
