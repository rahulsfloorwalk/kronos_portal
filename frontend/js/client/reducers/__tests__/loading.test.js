import { REQUEST, SUCCESS, FAILURE } from "../loading";
import loadingReducer from "../loading";
import { setLoading, setSuccess, setFailure } from "../loading";

describe("loadingReducer", () => {

	it("gets the initial state", () => {
		const state = loadingReducer(undefined, {});
		expect(state).toEqual({});
	});

	describe(REQUEST, () => {
		it("sets the request as loading", () => {
			const apiName = "foobar";
			const state = loadingReducer(undefined, {
				type: REQUEST,
				apiName,
			});
			expect(state[apiName]).toEqual(true);
		});
	});

	describe(SUCCESS, () => {
		it("sets the request as not loading", () => {
			const apiName = "foobar";
			const state = loadingReducer(undefined, {
				type: SUCCESS,
				apiName,
			});
			expect(state[apiName]).toEqual(false);
		});
	});

	describe(FAILURE, () => {
		it("sets the request as not loading", () => {
			const apiName = "foobar";
			const state = loadingReducer(undefined, {
				type: FAILURE,
				apiName,
			});
			expect(state[apiName]).toEqual(false);
		});
	});
});


describe(setLoading, () => {
	it("it returns an action to set the api as loading", () => {
		const apiName = "foobar";
		const action = setLoading(apiName);

		expect(action).toEqual({
			type: REQUEST,
			apiName,
		});
	});
});

describe(setSuccess, () => {
	it("it returns an action to set the api as successful", () => {
		const apiName = "foobar";
		const action = setSuccess(apiName);

		expect(action).toEqual({
			type: SUCCESS,
			apiName,
		});
	});
});

describe(setFailure, () => {
	it("it returns an action to set the api as failure", () => {
		const apiName = "foobar";
		const action = setFailure(apiName);

		expect(action).toEqual({
			type: FAILURE,
			apiName,
		});
	});
});
