import React from "react";
import { Provider } from "react-redux";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";

import { AuditStoreDetails } from "../../../manager/components/AuditStoreDetails";
import types from "../../../manager/action_types";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

let dateNowSpy;

beforeAll(() => {
	// Lock Time
	dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => 1527292800000);
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
		audit: {
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

	it("is rendered correctly when the AuditStore is loading", () => {
		const r = renderer.create(<AuditStoreDetails auditStore={undefined} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is not rated", () => {
		const r = renderer.create(<Provider store={sampleStore}>
			<AuditStoreDetails auditStore={sampleAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>);

		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is already rated", () => {
		const testAuditStore = Object.assign({}, sampleAuditStore, { qa_rating: 1});
		const r = renderer.create(<Provider store={sampleStore}>
			<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>);
		expect(r.toJSON()).toMatchSnapshot();
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
	for( const s of statuses){
		it(`is rendered correctly when status is ${s}`, () => {
			const testAuditStore = Object.assign({}, sampleAuditStore, { status: s });
			const r = renderer.create(<Provider store={sampleStore}>
				<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
			</Provider>);
			expect(r.toJSON()).toMatchSnapshot();
		});
	}

	it("dispatches the qa ok request action when QA OK button is clicked", (done) => {
		const testAuditStore = Object.assign({}, sampleAuditStore, { status: "SUBMITTED" });
		const r = shallow(<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>);
		let qaOkButton = r.find("div.panel-footer > button").at(1);
		expect(qaOkButton.length).toEqual(1);
		expect(qaOkButton.text()).toEqual("Forward to PM");
		qaOkButton.simulate("click");
		setTimeout(() => {
			expect(store.getActions()[1]).toEqual({
				type: types.AUDIT_STORE_ID_QA_OK,
				status: "request",
				auditStoreId: sampleParams.auditStoreId,
			});
			done();
		});
	});

	it("dispatches the PM REVERT request action when PM REVERT button is clicked", (done) => {
		const testAuditStore = Object.assign({}, sampleAuditStore, { status: "PM_REVIEW" });
		const r = shallow(<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>);
		let qaOkButton = r.find("div.panel-footer > button").at(0);
		expect(qaOkButton.length).toEqual(1);
		expect(qaOkButton.text()).toEqual("Revert to QA");
		qaOkButton.simulate("click");
		setTimeout(() => {
			expect(store.getActions()[1]).toEqual({
				type: types.AUDIT_STORE_ID_PM_REVERT,
				status: "request",
				auditStoreId: sampleParams.auditStoreId,
			});
			done();
		});
	});

	it("dispatches the ACCEPT request action when ACCEPT button is clicked", (done) => {
		const testAuditStore = Object.assign({}, sampleAuditStore, { status: "COMPLETED" });
		const r = shallow(<AuditStoreDetails auditStore={testAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>);
		const acceptButton = r.find("div.panel-footer > button").at(1);
		expect(acceptButton.length).toEqual(1);
		expect(acceptButton.text()).toEqual("Accept");
		acceptButton.simulate("click");
		setTimeout(() => {
			expect(store.getActions()[1]).toEqual({
				type: types.AUDIT_STORE_ID_ACCEPT,
				status: "request",
				auditStoreId: sampleParams.auditStoreId,
			});
			done();
		});
	});
});

afterAll(() => {
	// Unlock Time
	dateNowSpy.mockReset();
	dateNowSpy.mockRestore();
});
