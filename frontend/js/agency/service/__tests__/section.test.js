import { fetchSections } from "../section.js";
import axios from "axios";
jest.mock("axios");

beforeEach(() => {
	axios.get = jest.fn();
});

describe("fetchSections", () => {
	it("performs a GET to the correct URL", () => {
		axios.get.mockResolvedValue({
			data: [],
		});
		fetchSections(5);
		expect(axios.get).toBeCalledWith("/agency/audit_store/5/section");
	});
	it("extracts data from the response", (done) => {
		axios.get.mockResolvedValue({
			data: [],
		});
		fetchSections(5).then((data) => {
			expect(data).toEqual([]);
			done();
		});
	});
});
