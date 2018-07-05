import React from "react";
import renderer from "react-test-renderer";

import AuditStoreDetails from "../AuditStoreDetails.jsx";

describe("<AuditStoreDetails/>", () => {
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

	it("renders the details section for the audit store", () => {
		const tree = renderer.create(<AuditStoreDetails auditStore={sampleAuditStore}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
