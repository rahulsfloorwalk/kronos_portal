import React from "react";
import { shallow } from "enzyme";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";

import { AttachmentDisplayBox } from "../../../manager/components/AttachmentDisplayBox";

const middlewares = [ReduxThunk];
const mockStore = configureStore(middlewares);

describe("<AttachmentDisplayBox/>", () => {
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
		it(`computes editable correctly when status is ${s}`, () => {
			const auditStore = Object.assign({}, sampleAuditStore, { status: s });
			const r = shallow(<AttachmentDisplayBox auditStore={auditStore} dispatch={store.dispatch} router={mockRouter} />);
			const section = r.find("AttachmentPreview");
			expect(section.length).toEqual(1);
			expect(section.prop("editable")).toEqual(editable);
		});
	}
});

