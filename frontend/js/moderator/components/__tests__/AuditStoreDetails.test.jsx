import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import AuditStoreDetails from "../../../moderator/components/AuditStoreDetails";
import { FetchGuidlineByAuditStoreModerator,findById,findProofNotAvailable , qaOk } from "../../../moderator/service/audit_store";

jest.mock("../../../moderator/service/audit_store");

// Mock for React Datetime component
jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

let dateNowSpy;

beforeAll(() => {
	// Lock Time
	dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => 1527292800000);
});

afterAll(() => {
	// Unlock Time
	dateNowSpy.mockReset();
	dateNowSpy.mockRestore();
});

const mockFetchGuidlineByAuditStoreModerator = jest.fn(() => Promise.resolve({ guideline: {} }));
const mockFindProofNotAvailable = jest.fn(() => Promise.resolve([]));

describe("<AuditStoreDetails/>", () => {
	const sampleParams = {
		auditStoreId: "5",
	};

	const sampleLocation = {
		pathname: "foo/bar",
	};

	const sampleClient = {
		id: 6,
		name: "Client Name",
	};

	const sampleAuditStore = {
		id: parseInt(sampleParams.auditStoreId),
		user: {
			profileinfo: {
				first_name: "John",
				last_name: "Doe",
			}
		},
		audit_date: "2018-09-02",
		qa_rating: null,
		status: "ASSIGNED",
		report_summary: "Foobar",
		audit: {
			post_approval_description: "Conduct an Audit - Post Approval - Audit Description",
			audit_cycle: {
				post_approval_description: "Conduct an Audit - Post Approval - Audit Cycle Description",
				client: sampleClient,
			},
			store: {
				name: "Store Name",
				client: sampleClient,
				city: {
					id: 1,
					name: "Nagpur",
				},
			},
		},
	};

	it("is rendered correctly when the AuditStore is loading", () => {
		findById.mockReturnValue(new Promise(() => {}));
		FetchGuidlineByAuditStoreModerator.mockImplementation(mockFetchGuidlineByAuditStoreModerator);
		findProofNotAvailable.mockImplementation(mockFindProofNotAvailable);
		const r = renderer.create(<AuditStoreDetails params={sampleParams} location={sampleLocation}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is not rated", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		FetchGuidlineByAuditStoreModerator.mockImplementation(mockFetchGuidlineByAuditStoreModerator);
		const r = shallow(<AuditStoreDetails params={sampleParams} location={sampleLocation}/>);
		setTimeout(() => {
			r.update();
			expect(r).toMatchSnapshot();
			done();
		});
	});

	it("is rendered correctly when AuditStore is already rated", (done) => {
		sampleAuditStore.qa_rating = 1;
		findById.mockResolvedValue(sampleAuditStore);
		FetchGuidlineByAuditStoreModerator.mockImplementation(mockFetchGuidlineByAuditStoreModerator);
		findProofNotAvailable.mockResolvedValue([]);
		const r = shallow(<AuditStoreDetails params={sampleParams} location={sampleLocation}/>);
		setTimeout(() => {
			r.update();
			expect(r).toMatchSnapshot();
			done();
		});
	});

	const ratings = [ 0, 1, 2 ];
	test.each(ratings)("is rendered correctly for QA rating: %s", (rt, done) => {
		findById.mockResolvedValue(Object.assign({}, sampleAuditStore, { qa_rating: rt }));
		FetchGuidlineByAuditStoreModerator.mockImplementation(mockFetchGuidlineByAuditStoreModerator);
		findProofNotAvailable.mockResolvedValue([]);
		const r = shallow(<AuditStoreDetails params={sampleParams} location={sampleLocation}/>);
		setTimeout(() => {
			r.update();
			expect(r).toMatchSnapshot();
			done();
		});
	});

	const statuses = [
		"ASSIGNED",
		"ACKNOWLEDGED",
		"SUBMITTED",
		"PM_REVIEW",
		"COMPLETED",
		"ACCEPTED",
		"REJECTED",
		"WITHDRAWN",
		"FAILED",
	];
	test.each(statuses)("is rendered correctly wwhere AuditStore status is %s", (s, done) => {
		findById.mockResolvedValue(Object.assign({}, sampleAuditStore, { status: s }));
		FetchGuidlineByAuditStoreModerator.mockImplementation(mockFetchGuidlineByAuditStoreModerator);
		findProofNotAvailable.mockResolvedValue([]);
		const r = shallow(<AuditStoreDetails params={sampleParams} location={sampleLocation}/>);
		setTimeout(() => {
			r.update();
			expect(r).toMatchSnapshot();
			done();
		});
	});

	it("calls qaOk when QA OK button is clicked", (done) => {
		sampleAuditStore.status = "SUBMITTED";
		sampleAuditStore.qa_rating = 2;
		findById.mockResolvedValue(sampleAuditStore);
		FetchGuidlineByAuditStoreModerator.mockImplementation(mockFetchGuidlineByAuditStoreModerator);
		findProofNotAvailable.mockResolvedValue([]);
		qaOk.mockResolvedValue(Object.assign({}, sampleAuditStore, {
			status: "PM_REVIEW",
		}));
		const r = shallow(<AuditStoreDetails params={sampleParams} location={sampleLocation}/>);
		setTimeout(() => {
			r.update();
			const qaOkButton = r.find("div.panel-footer > button").at(1);
			expect(qaOkButton.length).toEqual(1);
			expect(qaOkButton.text()).toEqual("Forward to PM");
			qaOkButton.simulate("click");
			expect(qaOk).toBeCalledWith(sampleParams.auditStoreId);
			done();
		});
	});
});
