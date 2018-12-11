
import reducer from "../answer";

import types from "../../action_types";

describe(types.ANSWER_GET, () => {
	it("clears the answers on status request", () => {

		const nextState = reducer({}, {
			type: types.ANSWER_GET,
			status: "request",
		});

		expect(nextState).toEqual({});
	});
});
