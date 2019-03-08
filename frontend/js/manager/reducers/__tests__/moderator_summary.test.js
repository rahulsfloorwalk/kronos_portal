
import reducer from "../moderator_summary";

import types from "../../action_types";

describe(types.MODERATOR_SUMMARY, () => {
	const sampleSummary = {
		"foo": "bar",
	};

	it("sets the moderator summary", () => {

		const nextState = reducer({}, {
			type: types.MODERATOR_SUMMARY,
			moderatorSummary: sampleSummary,
		});

		expect(nextState).toEqual(sampleSummary);
	});
});
