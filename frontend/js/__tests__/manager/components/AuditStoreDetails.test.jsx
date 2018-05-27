import React from "react";
import PropTypes from "prop-types";
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
		sampleAuditStore.qa_rating = 1;
		const r = renderer.create(<Provider store={sampleStore}>
			<AuditStoreDetails auditStore={sampleAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly for all the statuses", () => {
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
			sampleAuditStore.status = s;
			const r = renderer.create(<Provider store={sampleStore}>
				<AuditStoreDetails auditStore={sampleAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>
			</Provider>);
			expect(r.toJSON()).toMatchSnapshot();
		}
	});

	it("dispatches the qa ok request action when QA OK button is clicked", (done) => {
		sampleAuditStore.status = "SUBMITTED";
		const r = shallow(<AuditStoreDetails auditStore={sampleAuditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter}/>);
		let qaOkButton = r.find("div.panel-footer > button").at(2);
		expect(qaOkButton.length).toEqual(1);
		expect(qaOkButton.text()).toEqual("QA OK");
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
});

afterAll(() => {
	// Unlock Time
	dateNowSpy.mockReset();
	dateNowSpy.mockRestore();
});
