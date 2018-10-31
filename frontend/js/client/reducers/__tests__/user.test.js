import { FETCH_USER } from "../../action_types";
import userReducer from "../user";
import { fetchUser } from "../user";

const sampleUser = {
	"id": 16,
	"full_name": "Foo Bar",
	"client": {    "id": 9,
		"name": "Foobar Corp.",
		"email": "foo@bar.com",
		"phone": "",
		"logo_url": "https://example.com/logo.png",
	},
	"user": {
		"id": 3734,
		"email": "foo@bar.in",
	},
	"is_client_admin": false,
};

describe("userReducer", () => {

	it("gets the initial state", () => {
		const state = userReducer(undefined, {});
		expect(state).toEqual({
			user: undefined,
		});
	});

	describe(FETCH_USER, () => {
		it("sets the user", () => {
			const state = userReducer(undefined, {
				type: FETCH_USER,
				user: sampleUser,
			});
			expect(state.user).toEqual(sampleUser);
		});
	});
});

describe(fetchUser, () => {
	it("returns an action to set the fetched user", () => {
		const action = fetchUser(sampleUser);

		expect(action).toEqual({
			type: FETCH_USER,
			user: sampleUser,
		});
	});
});

