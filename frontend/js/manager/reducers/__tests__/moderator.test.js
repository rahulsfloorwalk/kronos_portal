import reducer from "../moderator";

import types from "../../action_types";

describe(types.MODERATOR_GET, () => {
	const sampleModerators = [{
		id: 1,
		email: "some@randommoderator.com",
	}];
	it("sets the moderators in the list", () => {
		const nextState = reducer({}, {
			type: types.MODERATOR_GET,
			moderators: sampleModerators,
		});

		expect(nextState).toEqual(sampleModerators);
	});
});
