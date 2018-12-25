
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.CITY_GET, () => {
	const actionType = types.CITY_GET;

	describe("when the status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("clears the cities in the store", () => {
			expect(nextState.cities).toEqual([]);
		});
	});

	describe("when the status is success", () => {
		const sampleCities = [
			{
				id: 1,
				name: "Los Angeles",
				state: "US-CA",
			},
			{
				id: 2,
				name: "Nagpur",
				state: "IN-MH",
			},
		];

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				cities: sampleCities,
			});
		});

		it("sets the cities in the store", () => {
			expect(nextState.cities).toEqual(sampleCities);
		});
	});
});
