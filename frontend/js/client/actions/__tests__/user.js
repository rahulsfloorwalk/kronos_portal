import { fetchUser } from "../user";
import { FETCH_USER } from "../../action_types";
import * as userService from "../../service/user";

jest.mock("../../service/user");

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

describe(fetchUser, () => {
	it("it calls fetchsUser on the user service", () => {
		userService.fetchUser.mockResolvedValue(sampleUser);
		const dispatch = jest.fn();
		const thunk = fetchUser();

		thunk(dispatch);
		expect(userService.fetchUser).toHaveBeenCalled();
	});

	it("it dispatches an action to set the user when the request is successful", (done) => {
		userService.fetchUser.mockResolvedValue(sampleUser);
		const dispatch = jest.fn();
		const thunk = fetchUser();

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).toBeCalledWith({
				type: FETCH_USER,
				user: sampleUser,
			});
			done();
		});
	});
});
