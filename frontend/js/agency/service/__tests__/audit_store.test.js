import { fetchAuditStores, fetchAuditStore } from "../audit_store.js";
import axios from "axios";
jest.mock("axios");

beforeEach(() => {
	axios.get = jest.fn();
});

describe("fetchAuditStores", () => {
	it("performs a GET to the correct URL", () => {
		axios.get.mockResolvedValue({
			data: [],
		});
		fetchAuditStores();
		expect(axios.get).toBeCalledWith("/agency/audit_store");
	});
	it("extracts data from the response", (done) => {
		axios.get.mockResolvedValue({
			data: [],
		});
		fetchAuditStores().then((data) => {
			expect(data).toEqual([]);
			done();
		});
	});
});

describe("fetchAuditStore", () => {
	it("performs a GET to the correct URL", () => {
		axios.get.mockResolvedValue({
			data: {},
		});
		fetchAuditStore(5);
		expect(axios.get).toBeCalledWith("/agency/audit_store/5");
	});
	it("extracts data from the response", (done) => {
		axios.get.mockResolvedValue({
			data: {
				id: 5,
			},
		});
		fetchAuditStore(5).then((data) => {
			expect(data).toEqual({
				id: 5,
			});
			done();
		});
	});
});

