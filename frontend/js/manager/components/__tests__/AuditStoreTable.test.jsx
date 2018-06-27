import React from "react";
import renderer from "react-test-renderer";

import { AuditStoreTable } from "../AuditStoreList";

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

const sampleModerators = [
	{
		id: 5744,
		email: "alize@canberra.com",
	},
	{
		id: 5315,
		email: "bob@petersburg.ru",
	},
];

describe("<AuditStoreTable/>", () => {
	it("renders the list of audit stores correctly", () => {
		const onUpdate = jest.fn();
		const r = renderer.create(<AuditStoreTable auditStores={sampleAuditStores} moderators={sampleModerators} onUpdate={onUpdate}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});

