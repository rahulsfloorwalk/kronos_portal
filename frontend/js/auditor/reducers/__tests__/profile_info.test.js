
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.PROFILE_INFO_GET, () => {
	describe("when status is request", () => {
		it("sets loading to true", () => {
			const nextState = rootReducer(undefined, {
				type: types.PROFILE_INFO_GET,
				status: "request",
			});

			expect(nextState.loadingProfileInfo).toEqual(true);
		});
	});

	describe("when status is success", () => {
		const sampleProfileInfo = {
			id: 1,
			user_id: 1,
			full_name: "Brick Mortar",
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: types.PROFILE_INFO_GET,
				status: "success",
				profileInfo: sampleProfileInfo,
			});
		});

		it("sets loading to false", () => {
			expect(nextState.loadingProfileInfo).toEqual(false);
		});

		it("sets the profile info", () => {
			expect(nextState.profileInfo).toEqual(sampleProfileInfo);
		});
	});
});

describe(types.PROFILE_INFO_POST, () => {

	describe("when status is request", () => {
		it("clears the form errors", () => {
			const nextState = rootReducer(undefined, {
				type: types.PROFILE_INFO_POST,
				status: "request",
			});

			expect(nextState.forms.profileInfo.errors).toEqual({});
		});
	});

	describe("when status is success", () => {
		const sampleProfileInfo = {
			id: 1,
			user_id: 1,
			full_name: "Brick Mortar",
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: types.PROFILE_INFO_POST,
				status: "success",
				profileInfo: sampleProfileInfo,
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.profileInfo.errors).toEqual({});
		});

		it("sets the profile info", () => {
			expect(nextState.profileInfo).toEqual(sampleProfileInfo);
		});
	});

	describe("when status is error", () => {
		const sampleErrors = {
			full_name: ["This field is mandatory."],
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: types.PROFILE_INFO_POST,
				status: "error",
				errors: sampleErrors,
			});
		});

		it("clears the form errors", () => {
			expect(nextState.forms.profileInfo.errors).toEqual(sampleErrors);
		});
	});
});
