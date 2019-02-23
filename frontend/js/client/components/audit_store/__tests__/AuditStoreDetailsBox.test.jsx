import React from "react";
import renderer from "react-test-renderer";

import AuditStoreDetailsBox from "../AuditStoreDetailsBox.jsx";

const sampleAuditStore = {
	"id": 2113,
	"audit_date": "2018-02-17",
	"audit": {
		"id": 1321,
		"store": {
			"id": 91,
			"code": null,
			"type": "Arena",
			"priority": "",
			"name": "Bengaluru 1MG",
			"address": "2nd Floor, 1MG-Lido Mall, Trinity Circle",
			"city": {
				"id": 641,
				"name": "Bangalore",
				"state": "IN-KA"
			},
			"client": {
				"id": 9,
				"name": "Smaaash",
				"email": "saurabh.sawhney@smaaash.in",
				"phone": "",
				"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
			}
		},
		"audit_cycle": {
			"id": 96,
			"name": "Arena February 2018",
			"type": "WALKIN",
			"start_date": "2018-02-09",
			"end_date": "2018-02-25",
			"client": {
				"id": 9,
				"name": "Smaaash",
				"email": "saurabh.sawhney@smaaash.in",
				"phone": "",
				"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
			},
			"questionnaire_type": {
				"id": 58,
				"name": "Walkin",
				"is_default": false,
				"client_id": 9
			}
		}
	},
	"color": 4,
	"percentage": 81,
};

describe("<AuditStoreDetailsBox/>", () => {
	it("renders the AuditStoreDetailsBox table correctly", () => {
		const r = renderer.create(<AuditStoreDetailsBox auditStore={sampleAuditStore}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
