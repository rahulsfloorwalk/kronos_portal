
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.SOCIAL_INFO_GET, () => {
	const actionType = types.SOCIAL_INFO_GET;
	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("sets loading to true", () => {
			expect(nextState.loadingSocialInfo).toEqual(true);
		});
	});

	describe("when status is success", () => {
		const sampleSocialInfo = {
			id: 1,
			user_id: 1,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				socialInfo: sampleSocialInfo,
			});
		});

		it("sets loading to false", () => {
			expect(nextState.loadingSocialInfo).toEqual(false);
		});

		it("sets the social info", () => {
			expect(nextState.socialInfo).toEqual(sampleSocialInfo);
		});
	});
});

describe(types.SOCIAL_INFO_POST, () => {
	const actionType = types.SOCIAL_INFO_POST;

	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.socialInfo.errors).toEqual({});
		});
	});

	describe("when status is success", () => {
		const sampleSocialInfo = {
			id: 1,
			user_id: 1,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				socialInfo: sampleSocialInfo,
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.socialInfo.errors).toEqual({});
		});

		it("sets the social info", () => {
			expect(nextState.socialInfo).toEqual(sampleSocialInfo);
		});
	});

	describe("when status is error", () => {
		const sampleErrors = {
			access_token: ["This field is mandatory."],
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
			expect(nextState.forms.socialInfo.errors).toEqual(sampleErrors);
		});
	});
});
