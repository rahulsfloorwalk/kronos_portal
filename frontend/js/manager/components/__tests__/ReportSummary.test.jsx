import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";

import __ReportSummary from "../ReportSummary";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));


const middlewares = [ReduxThunk];
const mockStore = configureStore(middlewares);

describe("<ReportSummary/>", () => {
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

	it("is rendered correctly when audit store is editable", () => {
		const r = renderer.create(<Provider store={sampleStore}>
			<__ReportSummary auditStoreId={parseInt(sampleParams.auditStoreId)} isEditable={true} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when audit store is not editable", () => {
		const r = renderer.create(<Provider store={sampleStore}>
			<__ReportSummary auditStoreId={parseInt(sampleParams.auditStoreId)} isEditable={false} dispatch={store.dispatch} router={mockRouter}/>
		</Provider>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});

