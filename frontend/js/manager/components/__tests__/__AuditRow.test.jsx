import React from "react";
import { shallow } from "enzyme";
import $ from "jquery";

import { __AuditRow } from "../AuditList";

describe("<__AuditRow/>", () => {
	const sampleAuditCycleId = "5";
	const sampleSerial = 1;

	const sampleAudit = {
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
		"audit_cycle": 114,
		"post_approval_description": "",
		"application_count": 17,
		"report_count": 2,
		"valid_report_count": 1
	};

	it("renders priority column", () => {
		const dispatch = jest.fn();
		dispatch.mockReturnValue($.Deferred().resolve([]).promise());
		const r = shallow(<__AuditRow
			auditCycleId={sampleAuditCycleId}
			audit={sampleAudit}
			dispatch={dispatch}
			showPriority={true}
			serial={sampleSerial}
			onDelete={jest.fn()}
		/>);
		expect(r.find("td").at(2).text()).toEqual(sampleAudit.store.priority);
	});
});

