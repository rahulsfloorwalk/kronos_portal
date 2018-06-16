import React from "react";
import renderer from "react-test-renderer";

import { RouterContextProvider } from "../../../../test_utils.js";

import { AuditCycleDetails } from "../AuditCycleDetails";

const sampleParams = {
	auditCycleId: "5",
};

const sampleAuditCycle = {
	"id": 81,
	"name": "Pilot December 2017",
	"type": "WALKIN",
	"status": "ARCHIVED",
	"start_date": "2017-12-19",
	"end_date": "2017-12-31",
	"earnings_per_audit": 300,
	"reimbursement": 200,
	"description": "This is a disclosed survey.",
	"post_approval_description": "Hello World",
	"client": {
		"id": 28,
		"name": "Amazon",
		"brand_name": "Amazon",
		"email": "foo@bar.com",
		"phone": "",
		"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/amazon_logo_RGB.jpg",
		"brand_logo_url": ""
	},
	"audit_count": 310,
	"questionnaire_type": {
		"id": 18,
		"name": "Seriously? Though.",
		"is_default": false,
		"client": 28,
		"client_id": 28
	},
};

describe("<AuditCycleDetails/>", () => {
	it("renders correctly when audit cycle has loaded correctly", () => {
		const dispatch = jest.fn();
		const tree = renderer
			.create(<RouterContextProvider><AuditCycleDetails params={sampleParams} auditCycle={sampleAuditCycle} dispatch={dispatch}/></RouterContextProvider>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders correctly when audit cycle is loading", () => {
		const dispatch = jest.fn();
		const tree = renderer.create(<AuditCycleDetails params={sampleParams} auditCycle={null} dispatch={dispatch}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
