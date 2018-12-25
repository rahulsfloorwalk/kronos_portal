
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.USER_GET, () => {
	const sampleUser = {
		id: 1,
		email: "brick@mortar.com",
		username: "brick@mortar.com",
	};
	it("sets the given user", () => {
		const nextState = rootReducer(undefined, {
			type: types.USER_GET,
			status: "success",
			user: sampleUser,
		});

		expect(nextState.user).toEqual(sampleUser);
	});
});
