import { fetchUser } from "../user";
import $ from "jquery";

jest.mock("jquery");

beforeEach(() => {
	$.get = jest.fn();
});

describe("fetchUser", () => {
	it("performs a GET to fetch the currency user", () => {
		fetchUser();
		expect($.get).toBeCalledWith("/client/user");
	});
});
