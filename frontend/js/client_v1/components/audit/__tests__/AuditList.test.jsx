import React from "react";
import { shallow } from "enzyme";
import $ from "jquery";

import { AuditList } from "../AuditList";

describe("<AuditList/>", () => {
	const sampleParams = {
		auditCycleId: "5",
	};
	const sampleAuditCycle = {
		"id": 114,
		"name": "FloorWalk Demo - March 2021",
		"type": "WALKIN",
		"status": "ACTIVE",
		"start_date": "2021-05-01",
		"end_date": "2022-03-31",
		"planned_audit": 100,
		"earnings_per_audit": 500,
		"reimbursement": 100,
		"charge_per_audit": 800,
		"system_cost": 100,
		"description": "test test",
		"post_approval_description": "test"
	};

	const sampleAudits = [
		{
			"id": 1505,
			"count": 1,
			"audit_date": "2018-07-01",
			"hidden": true,
			"earnings_per_audit": null,
			"reimbursement": 5100,
			"store": {
				"id": 1098,
				"name": "Bangalore Marketcity",
				"address": "2nd Floor, Phoenix Marketcity, Mahadevpura, Whitefield Main Rd, Devasandra, Industrial estate, Krishnarajapura",
				"code": null,
				"type": "Arena",
				"priority": "HIGH",
				"phone": "080 25066900",
				"city": {
					"id": 641,
					"name": "Bangalore",
					"state": "IN-KA",
					"lat": "12.971599",
					"lon": "77.594563",
					"gmaps_url": "http://maps.google.com/maps/place/Bangalore/@12.971599,77.594563,12z"
				},
				"client_id": 9,
				"city_id": 641
			},
			"audit_cycle": sampleAuditCycle,
			"post_approval_description": "",
			"application_count": 17,
			"report_count": 2,
			"valid_report_count": 1
		},
		{
			"id": 1506,
			"count": 1,
			"audit_date": null,
			"hidden": true,
			"earnings_per_audit": null,
			"reimbursement": 5100,
			"store": {
				"id": 1097,
				"name": "Chandigarh Elante Mall",
				"address": "Shop no- 309,310, 3rd Floor, Elante Mall, Industrial area, Phase-1",
				"code": null,
				"type": "Arena",
				"priority": "HIGH",
				"phone": "0172 5213555",
				"city": {
					"id": 107,
					"name": "Chandigarh",
					"state": "IN-CH",
					"lat": "30.733315",
					"lon": "76.779418",
					"gmaps_url": "http://maps.google.com/maps/place/Chandigarh/@30.733315,76.779418,12z"
				},
				"client_id": 9,
				"city_id": 107
			},
			"audit_cycle": sampleAuditCycle,
			"post_approval_description": "",
			"application_count": 13,
			"report_count": 1,
			"valid_report_count": 1
		},
		{
			"id": 1507,
			"count": 1,
			"audit_date": null,
			"hidden": true,
			"earnings_per_audit": null,
			"reimbursement": 5100,
			"store": {
				"id": 1096,
				"name": "Pune Phoenix Marketcity",
				"address": "Shop no. 28, Lower Ground level, Phoenix Marketcity, Viman nagar",
				"code": null,
				"type": "Arena",
				"priority": "MEDIUM",
				"phone": "020 66335000",
				"city": {
					"id": 2,
					"name": "Pune",
					"state": "IN-MH",
					"lat": "18.520430",
					"lon": "73.856744",
					"gmaps_url": "http://maps.google.com/maps/place/Pune/@18.520430,73.856744,12z"
				},
				"client_id": 9,
				"city_id": 2
			},
			"audit_cycle": sampleAuditCycle,
			"post_approval_description": "",
			"application_count": 40,
			"report_count": 1,
			"valid_report_count": 1
		},
		{
			"id": 1508,
			"count": 1,
			"audit_date": null,
			"hidden": true,
			"earnings_per_audit": null,
			"reimbursement": 5100,
			"store": {
				"id": 1095,
				"name": "Ambi, Gurgaon",
				"address": "4th Floor, Ambience Mall, Near Toll Plaza",
				"code": null,
				"type": "Arena",
				"priority": "MEDIUM",
				"phone": "0124 4665612",
				"city": {
					"id": 170,
					"name": "Gurgaon",
					"state": "IN-HR",
					"lat": "28.459497",
					"lon": "77.026638",
					"gmaps_url": "http://maps.google.com/maps/place/Gurgaon/@28.459497,77.026638,12z"
				},
				"client_id": 9,
				"city_id": 170
			},
			"audit_cycle": sampleAuditCycle,
			"post_approval_description": "",
			"application_count": 23,
			"report_count": 1,
			"valid_report_count": 1
		},
		{
			"id": 1509,
			"count": 1,
			"audit_date": null,
			"hidden": true,
			"earnings_per_audit": null,
			"reimbursement": 5100,
			"store": {
				"id": 1094,
				"name": "Ambi, Vasant Kunj",
				"address": "1st Floor, Ambience Mall, Nelson Mandela Marg",
				"code": null,
				"type": "Arena",
				"priority": "LOW",
				"phone": "011 40870160",
				"city": {
					"id": 650,
					"name": "Delhi",
					"state": "IN-DL",
					"lat": "28.704059",
					"lon": "77.102490",
					"gmaps_url": "http://maps.google.com/maps/place/Delhi/@28.704059,77.102490,12z"
				},
				"client_id": 9,
				"city_id": 650
			},
			"audit_cycle": sampleAuditCycle,
			"post_approval_description": "",
			"application_count": 20,
			"report_count": 1,
			"valid_report_count": 1
		},
		{
			"id": 1510,
			"count": 1,
			"audit_date": null,
			"hidden": true,
			"earnings_per_audit": null,
			"reimbursement": 5100,
			"store": {
				"id": 95,
				"name": "Noida MOI",
				"address": "A-501, B-504, 4th Floor, Mall of India",
				"code": null,
				"type": "Arena",
				"priority": "LOW",
				"phone": "0120 6209955",
				"city": {
					"id": 644,
					"name": "Noida",
					"state": "IN-UP",
					"lat": "28.535516",
					"lon": "77.391026",
					"gmaps_url": "http://maps.google.com/maps/place/Noida/@28.535516,77.391026,12z"
				},
				"client_id": 9,
				"city_id": 644
			},
			"audit_cycle": sampleAuditCycle,
			"post_approval_description": "",
			"application_count": 18,
			"report_count": 2,
			"valid_report_count": 1
		},
	];

	it("renders the correct number of priority filter options", () => {
		const dispatch = jest.fn();
		dispatch.mockReturnValue($.Deferred().resolve([]).promise());
		const r = shallow(<AuditList params={sampleParams} audits={sampleAudits} dispatch={dispatch}/>);
		expect(r.find("select").at(0).children("option").length).toEqual(4);
	});

	it("renders the correct number of audit date filter options", () => {
		const dispatch = jest.fn();
		dispatch.mockReturnValue($.Deferred().resolve([]).promise());
		const r = shallow(<AuditList params={sampleParams} audits={sampleAudits} dispatch={dispatch}/>);
		expect(r.find("select").at(1).children("option").length).toEqual(3);
	});

	it("renders the correct number of city filter options", () => {
		const dispatch = jest.fn();
		dispatch.mockReturnValue($.Deferred().resolve([]).promise());
		const r = shallow(<AuditList params={sampleParams} audits={sampleAudits} dispatch={dispatch}/>);
		expect(r.find("select").at(2).children("option").length).toEqual(7);
	});
});

