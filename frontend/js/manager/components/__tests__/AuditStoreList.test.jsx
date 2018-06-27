import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { AuditStoreList, AuditStoreTable } from "../AuditStoreList";
import { findAuditStoresByAuditCycle  } from "../../service/audit_store.js";
jest.mock("../../service/audit_store.js");

const sampleAudits = [
	{
		"id": 2781,
		"count": 1,
		"audit_date": null,
		"hidden": false,
		"earnings_per_audit": null,
		"reimbursement": 1200,
		"store": {
			"id": 2138,
			"name": "Smaaash Bhopal",
			"address": "3rd Floor, DP City Mall, Arera Hills, Opp Zone-1 MP Nagar",
			"code": null,
			"type": "Smaaash Zone",
			"priority": "",
			"phone": "7045911628",
			"city": {
				"id": 296,
				"name": "Bhopal",
				"state": "IN-MP",
				"lat": "23.259933",
				"lon": "77.412615",
				"gmaps_url": "http://maps.google.com/maps/place/Bhopal/@23.259933,77.412615,12z"
			},
			"client_id": 9,
			"city_id": 296
		},
		"audit_cycle": 179,
		"post_approval_description": "",
		"application_count": 10,
		"report_count": 1,
		"valid_report_count": 1
	},
	{
		"id": 2782,
		"count": 1,
		"audit_date": null,
		"hidden": false,
		"earnings_per_audit": null,
		"reimbursement": 1200,
		"store": {
			"id": 2140,
			"name": "LEPL Centro Mall",
			"address": "LEPL CENTRO MALL, 2nd FLOOR, 40-01-46/A, MG ROAD, LABBIPET, VIJAYAWADA, KRISHNA DIST.",
			"code": null,
			"type": "Smaaash Zone",
			"priority": "",
			"phone": "0866-6639966",
			"city": {
				"id": 713,
				"name": "Vijayawada",
				"state": "IN-AP",
				"lat": "16.506174",
				"lon": "80.648015",
				"gmaps_url": "http://maps.google.com/maps/place/Vijayawada/@16.506174,80.648015,12z"
			},
			"client_id": 9,
			"city_id": 713
		},
		"audit_cycle": 179,
		"post_approval_description": "",
		"application_count": 7,
		"report_count": 1,
		"valid_report_count": 1
	},
];

const sampleAuditStores = [
	{
		"id": 3925,
		"status": "PM_REVIEW",
		"audit_date": "2018-06-09",
		"audit": 2781,
		"user": {
			"id": 4930,
			"email": "Supriyabaral0612@gmail.com",
			"profileinfo": {
				"id": 4782,
				"first_name": "Supriya",
				"last_name": "Baral",
				"mobile_number": "7400619309",
				"city": 296,
				"user_id": 4930
			}
		},
		"qa_rating": 2,
		"assigned_to_moderator": [
			5744
		]
	},
	{
		"id": 3930,
		"status": "SUBMITTED",
		"audit_date": "2018-06-09",
		"audit": 2782,
		"user": {
			"id": 4995,
			"email": "pkareemalikhan@gmail.com",
			"profileinfo": {
				"id": 4846,
				"first_name": "Ali",
				"last_name": "Khan",
				"mobile_number": "9966334024",
				"city": 713,
				"user_id": 4995
			}
		},
		"qa_rating": null,
		"assigned_to_moderator": [
			5315
		]
	},
];

describe("<AuditStoreList/>", () => {
	const sampleParams = {
		auditCycleId: "5",
	};

	it("renders the list of audit stores correctly", (done) => {
		const dispatch = jest.fn().mockResolvedValue(sampleAudits);
		findAuditStoresByAuditCycle.mockResolvedValue(sampleAuditStores);
		const r = renderer.create(<AuditStoreList params={sampleParams} dispatch={dispatch}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("filters the reports by status", (done) => {
		const dispatch = jest.fn().mockResolvedValue(sampleAudits);
		findAuditStoresByAuditCycle.mockResolvedValue(sampleAuditStores);

		const selectedStatus = "PM_REVIEW";
		const r = shallow(<AuditStoreList params={sampleParams} dispatch={dispatch}/>);
		setTimeout(() => {
			r.update();
			const select = r.find("select");
			select.simulate("change", { target: { value: selectedStatus, }, });
			r.update();
			expect(r.find(AuditStoreTable).length).toEqual(1);
			expect(r.find(AuditStoreTable).prop("auditStores").length).toEqual(1);
			done();
		});
	});
});

