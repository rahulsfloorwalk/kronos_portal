import React from "react";
import renderer from "react-test-renderer";

import { fetchAuditCyclesByClient } from "../../../service/audit_cycle.js";
import AuditCycleList from "../AuditCycleList.jsx";

jest.mock("../../../service/audit_cycle.js");

const sampleParams = {
	clientId: "5",
};


const sampleAuditCycles = [
	{
		"id": 107,
		"name": "Telephonic February 2018",
		"type": "PHONE",
		"status": "ARCHIVED",
		"start_date": "2018-02-23",
		"end_date": "2018-03-01",
		"earnings_per_audit": 150,
		"reimbursement": null,
		"description": "Perform a ",
		"post_approval_description": "### Audit Guidelines: * Make a phone call at assigned showroom and portray as a potential customer for buying car.* ",
		"client": {
			"id": 35,
			"name": "Hyundai",
			"brand_name": "Hyundai",
			"email": "sachind@uja.in",
			"phone": "",
			"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Hyundai-logo-grey-400.png",
			"brand_logo_url": ""
		},
		"audit_count": 19,
		"questionnaire_type": {
			"id": 199,
			"name": "Phone",
			"is_default": false,
			"client": 35,
			"client_id": 35
		}
	},
	{
		"id": 106,
		"name": "February 2018",
		"type": "WALKIN",
		"status": "ARCHIVED",
		"start_date": "2018-02-23",
		"end_date": "2018-02-28",
		"earnings_per_audit": 500,
		"reimbursement": null,
		"description": "Conduct a Walkin audit ",
		"post_approval_description": "Make a visit to the showroom as a customer looking to purchase a car.* Enquire for any car mo",
		"client": {
			"id": 35,
			"name": "Hyundai",
			"brand_name": "Hyundai",
			"email": "sachind@uja.in",
			"phone": "",
			"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Hyundai-logo-grey-400.png",
			"brand_logo_url": ""
		},
		"audit_count": 19,
		"questionnaire_type": null,
	},
];

describe("<AuditCycleList/>", () => {
	it("renders a list of audit cycles", (done) => {
		fetchAuditCyclesByClient.mockResolvedValue(sampleAuditCycles);
		const r = renderer.create(<AuditCycleList params={sampleParams}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});
