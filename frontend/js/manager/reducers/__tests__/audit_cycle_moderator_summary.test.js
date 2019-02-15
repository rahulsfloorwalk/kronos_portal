
import reducer from "../audit_cycle_moderator_summary";

import types from "../../action_types";

describe(types.AUDIT_CYCLE_MODERATOR_SUMMARY, () => {
	const sampleSummary = {
		"foo": "bar",
	};

	it("sets the moderator summary for the given audit cycle id", () => {

		const nextState = reducer({}, {
			type: types.AUDIT_CYCLE_MODERATOR_SUMMARY,
			auditCycleId: 1,
			moderatorSummary: sampleSummary,
		});

		expect(nextState).toEqual({
			1: sampleSummary,
		});
	});
});
