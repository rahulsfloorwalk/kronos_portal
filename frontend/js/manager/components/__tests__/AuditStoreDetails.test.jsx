import React from "react";
import { Provider } from "react-redux";
import { shallow } from "enzyme";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";

import { AuditStoreDetails } from "../../../manager/components/AuditStoreDetails";
import types from "../../../manager/action_types";

import { fetchAuditStore, acceptAuditStore, pmRevertAuditStore, qaOkAuditStore } from "../../actions/audit_store";

jest.mock("../../actions/audit_store");

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

const middlewares = [ReduxThunk];
const mockStore = configureStore(middlewares);

describe("<AuditStoreDetails/>", () => {
	const sampleParams = {
		auditStoreId: "5",
	};
	const sampleClient = {
		id: 6,
		name: "Client Name",
	};
	const sampleStore = {
		subscribe: jest.fn(),
		dispatch: jest.fn(),
		getState: jest.fn().mockImplementation(() => {
			return {
				auditStores: {
					[sampleAuditStore.id]: sampleAuditStore,
				},
				reportAttributes: {
					[sampleAuditStore.audit.audit_cycle.id]: [],
				},
			};
		}),
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
		earnings_per_audit: 500,
		reimbursement: 700,
		report_summary: "Foobar",
		audit: {
			id: 125432,
			post_approval_description: "Conduct an Audit - Post Approval - Audit Description",
			audit_cycle: {
				id: 453,
				post_approval_description: "Conduct an Audit - Post Approval - Audit Cycle Description",
				client: sampleClient,
				type: "WALKIN",
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

	let store, mockRouter;

	beforeEach(() => {
		store = mockStore({});

		mockRouter = {
			goBack: jest.fn(),
		};
	});

	beforeEach(() => {
		fetchAuditStore.mockReturnValue({
			type: types.AUDIT_STORE_ID_GET,
			status: "request",
			auditStoreId: sampleAuditStore.id,
		});
		qaOkAuditStore.mockReturnValue({
			type: types.AUDIT_STORE_ID_QA_OK,
			status: "request",
			auditStoreId: sampleAuditStore.id,
		});
		pmRevertAuditStore.mockReturnValue({
			type: types.AUDIT_STORE_ID_PM_REVERT,
			status: "request",
			auditStoreId: sampleAuditStore.id,
		});
		acceptAuditStore.mockReturnValue({
			type: types.AUDIT_STORE_ID_ACCEPT,
			status: "request",
			auditStoreId: sampleAuditStore.id,
		});
	});

	it("is rendered correctly when the AuditStore is loading", () => {
		const r = shallow(<Provider store={sampleStore}>
			<AuditStoreDetails auditStore={undefined} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>).dive();
		expect(r).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is not rated", () => {
		const r = shallow(<Provider store={sampleStore}>
			<AuditStoreDetails auditStore={sampleAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>).dive();

		expect(r).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is already rated", () => {
		const testAuditStore = Object.assign({}, sampleAuditStore, { qa_rating: 1});
		const r = shallow(<Provider store={sampleStore}>
			<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>).dive();
		expect(r).toMatchSnapshot();
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
	test.each(statuses)("is rendered correctly when status is %s", (s) => {
		const testAuditStore = Object.assign({}, sampleAuditStore, { status: s });
		const r = shallow(<Provider store={sampleStore}>
			<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>).dive();
		expect(r).toMatchSnapshot();
	});

	it("dispatches the qa ok request action when QA OK button is clicked", (done) => {
		sampleStore.dispatch.mockResolvedValue("SUCCESS");
		const testAuditStore = Object.assign({}, sampleAuditStore, { status: "SUBMITTED" });
		const r = shallow(<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={sampleStore.dispatch} router={mockRouter}/>);
		const qaOkButton = r.find("div.panel-footer > button").at(1);
		expect(qaOkButton.length).toEqual(1);
		expect(qaOkButton.text()).toEqual("Forward to PM");
		qaOkButton.simulate("click");
		setTimeout(() => {
			expect(sampleStore.dispatch).nthCalledWith(2, {
				type: types.AUDIT_STORE_ID_QA_OK,
				status: "request",
				auditStoreId: testAuditStore.id,
			});
			done();
		});
	});

	it("dispatches the PM REVERT request action when PM REVERT button is clicked", (done) => {
		sampleStore.dispatch.mockResolvedValue("SUCCESS");
		const testAuditStore = Object.assign({}, sampleAuditStore, { status: "PM_REVIEW" });
		const r = shallow(<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={sampleStore.dispatch} router={mockRouter}/>);
		const qaOkButton = r.find("div.panel-footer > button").at(0);
		expect(qaOkButton.length).toEqual(1);
		expect(qaOkButton.text()).toEqual("Revert to QA");
		qaOkButton.simulate("click");
		setTimeout(() => {
			expect(sampleStore.dispatch).nthCalledWith(2, {
				type: types.AUDIT_STORE_ID_PM_REVERT,
				status: "request",
				auditStoreId: testAuditStore.id,
			});
			done();
		});
	});

	it("dispatches the ACCEPT request action when ACCEPT button is clicked", (done) => {
		sampleStore.dispatch.mockResolvedValue("SUCCESS");
		const testAuditStore = Object.assign({}, sampleAuditStore, { status: "COMPLETED" });
		const r = shallow(<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={sampleStore.dispatch} router={mockRouter}/>);

		const acceptButton = r.find("div.panel-footer > button").at(1);
		expect(acceptButton.length).toEqual(1);
		expect(acceptButton.text()).toEqual("Accept");
		acceptButton.simulate("click");
		setTimeout(() => {
			expect(sampleStore.dispatch).nthCalledWith(2, {
				type: types.AUDIT_STORE_ID_ACCEPT,
				status: "request",
				auditStoreId: testAuditStore.id,
			});
			done();
		});
	});
});
