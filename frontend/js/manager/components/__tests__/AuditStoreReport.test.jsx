import React from "react";
import { shallow } from "enzyme";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";

import { AuditStoreReport } from "../../../manager/components/AuditStoreReport";

const middlewares = [ReduxThunk];
const mockStore = configureStore(middlewares);

describe("<AuditStoreReport/>", () => {
	const sampleParams = {
		auditStoreId: "5",
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
		audit: {
			id: 15432,
			post_approval_description: "Conduct an Audit - Post Approval - Audit Description",
			audit_cycle: {
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

	const sampleSections = {
		"1163": {
			"id": 1163,
			"name": "Visit Details",
			"audit_cycle": 153,
			"sequence": 1,
			"questions": [{
				"id": 8092,
				"sequence": 1,
				"question_txt": "Date of Visit",
				"max_marks": 0,
				"section": 1163,
				"question_type": "PLAIN",
				"question_data": {}
			},
			],
		}
	};

	let store, mockRouter;

	beforeEach(() => {
		store = mockStore({});

		mockRouter = {
			goBack: jest.fn(),
		};
	});

	it("computes editable correctly for all the statuses", () => {
		const statuses = [
			["ASSIGNED", false],
			["ACKNOWLEDGED", false],
			["SUBMITTED", true],
			["PM_REVIEW", true],
			["COMPLETED", false],
			["ACCEPTED", false],
			["REJECTED", false],
			["WITHDRAWN", false],
			["FAILED", false],
		];
		for( const [s, editable] of statuses){
			const auditStore = Object.assign({}, sampleAuditStore, { status: s });
			const r = shallow(<AuditStoreReport auditStore={auditStore} params={sampleParams} dispatch={store.dispatch} router={mockRouter} sections={sampleSections}/>);
			const section = r.find("Connect(__Section)");
			expect(section.length).toEqual(1);
			expect(section.prop("editable")).toEqual(editable);
		}
	});
});

