
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.STATE_GET, () => {
	const actionType = types.STATE_GET;
	const sampleStates = {
		"IN-MH": "Maharashtra",
	};
	describe("when the status is success", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				states: sampleStates,
			});
		});

		it("sets the states in the store", () => {
			expect(nextState.states).toEqual(sampleStates);
		});
	});
});
