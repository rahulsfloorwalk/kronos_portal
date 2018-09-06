import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import AuditStoreList, { __AuditStoreList, AuditStoreRow } from "../AuditStoreList.jsx";
import { fetchAuditStores } from "../../service/audit_store";

jest.mock("../../service/audit_store");

describe("<AuditStoreRow/>", () => {
	const sampleAuditStore = {
		id: 2,
		status: "ACKNOWLEDGED",
		audit_date: "2018-02-02",
		audit: {
			earnings_per_audit: 500,
			reimbursement: 400,
			post_approval_description: "Hello World",
			audit_cycle: {
				type: "WALKIN",
				client: {
					auditor_display_name: "Ravi",
				},
				post_approval_description: "Hello World",
			},
			store: {
				name: "Factory Outlet",
				address: "Shankar Nagar, Dharampeth, Nagpur",
			},
		},
	};


	it("renders a single auditStore list item correctly", () => {
		const auditStore = Object.assign({}, sampleAuditStore, {
			earnings_per_audit: 600,
			reimbursement: 500,
		});
		const r = renderer.create(<AuditStoreRow auditStore={auditStore}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders a single auditStore list item correctly with amounts from the audit", () => {
		const r = renderer.create(<AuditStoreRow auditStore={sampleAuditStore}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});

describe("<__AuditStoreList/>", () => {
	const sampleAuditStores = [
		{
			id: 2,
			status: "ACKNOWLEDGED",
			audit_date: "2018-02-02",
			earnings_per_audit: 600,
			reimbursement: 500,
			audit: {
				earnings_per_audit: 500,
				reimbursement: 400,
				post_approval_description: "Hello World",
				audit_cycle: {
					type: "WALKIN",
					client: {
						auditor_display_name: "Ravi",
					},
					post_approval_description: "Hello World",
				},
				store: {
					name: "Factory Outlet",
					address: "Shankar Nagar, Dharampeth, Nagpur",
				},
			},
		},
		{
			id: 3,
			status: "ASSIGNED",
			audit_date: "2018-02-02",
			audit: {
				earnings_per_audit: 500,
				reimbursement: 400,
				post_approval_description: "Hello World",
				audit_cycle: {
					type: "WALKIN",
					client: {
						auditor_display_name: "Ravi",
					},
					post_approval_description: "Hello World",
				},
				store: {
					name: "Factory Outlet",
					address: "Shankar Nagar, Dharampeth, Nagpur",
				},
			},
		},
	];


	it("is renders a list of audit stores correctly", () => {
		const r = renderer.create(<__AuditStoreList auditStores={sampleAuditStores}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders an empty list correctly", () => {
		const r = renderer.create(<__AuditStoreList auditStores={[]}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});

describe("<AuditStoreList/>", () => {
	const sampleAuditStores = [
		{
			id: 2,
			status: "ACKNOWLEDGED",
			audit_date: "2018-02-02",
			audit: {
				earnings_per_audit: 500,
				reimbursement: 400,
				post_approval_description: "Hello World",
				audit_cycle: {
					type: "WALKIN",
					client: {
						auditor_display_name: "Ravi",
					},
					post_approval_description: "Hello World",
				},
				store: {
					name: "Factory Outlet",
					address: "Shankar Nagar, Dharampeth, Nagpur",
				},
			},
		},
		{
			id: 3,
			status: "ASSIGNED",
			audit_date: "2018-02-02",
			audit: {
				earnings_per_audit: 500,
				reimbursement: 400,
				post_approval_description: "Hello World",
				audit_cycle: {
					type: "WALKIN",
					client: {
						auditor_display_name: "Ravi",
					},
					post_approval_description: "Hello World",
				},
				store: {
					name: "Factory Outlet",
					address: "Shankar Nagar, Dharampeth, Nagpur",
				},
			},
		},
	];


	it("fetches the list of audit stores correctly", () => {
		fetchAuditStores.mockResolvedValue(sampleAuditStores);
		shallow(<AuditStoreList/>);
		expect(fetchAuditStores).toHaveBeenCalled();
	});

	it("renders an empty list correctly", (done) => {
		fetchAuditStores.mockResolvedValue(sampleAuditStores);
		const r = shallow(<AuditStoreList/>);
		setTimeout(() => {
			r.update();
			expect(r.find(__AuditStoreList).prop("auditStores")).toEqual(sampleAuditStores);
			done();
		});
	});
});
