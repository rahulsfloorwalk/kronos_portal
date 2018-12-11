import reducer from "../client_user_visibility";

import types from "../../action_types";

describe(types.CLIENT_USER_STORE_VISIBILITY, () => {
	it("sets the given client users for the store ID", () => {
		const storeId = 5;
		const sampleClientUsers = [4, 5, 6, 7];

		const nextState = reducer({}, {
			type: types.CLIENT_USER_STORE_VISIBILITY,
			status: "success",
			clientUsers: sampleClientUsers,
			storeId,
		});

		expect(nextState).toEqual({
			[storeId]: sampleClientUsers,
		});
	});
});
