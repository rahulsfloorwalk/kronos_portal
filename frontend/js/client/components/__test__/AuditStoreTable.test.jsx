import React from "react";
import renderer from "react-test-renderer";

import { AuditStoreTable } from "../AuditStoreTable";

describe(AuditStoreTable, () => {
	const sampleAuditStores = [{
		"store_name": "ayoun the optic shop",
		"store_priority": "ONE",
		"audit_date": "2018-05-10",
		"city_id": 641,
		"audit_store_id": 3075,
		"city_name": "Bangalore",
		"store_id": 1461,
		"sections": [{
			"color": 1,
			"sequence": 1,
			"max_marks": 0,
			"section": "Audit Details",
			"percentage": 0
		}, {
			"color": 2,
			"sequence": 2,
			"max_marks": 4,
			"section": "Brand Pitch",
			"percentage": 50
		}, {
			"color": 4,
			"sequence": 3,
			"max_marks": 2,
			"section": "Recommendations",
			"percentage": 100
		}, {
			"color": 1,
			"sequence": 4,
			"max_marks": 4,
			"section": "Feedback",
			"percentage": 0
		}],
		"store_code": null,
		"store_type": "10 pairs",
		"total_score": {
			"percentage": 73,
			"max_marks": 56,
			"color": 3,
		},
	}, {
		"store_name": "aneesh vision vare",
		"store_priority": "TWO",
		"audit_date": "2018-05-20",
		"city_id": 641,
		"audit_store_id": 3049,
		"city_name": "Bangalore",
		"store_id": 1462,
		"sections": [{
			"color": 1,
			"sequence": 1,
			"max_marks": 0,
			"section": "Audit Details",
			"percentage": 0
		}, {
			"color": 2,
			"sequence": 2,
			"max_marks": 4,
			"section": "Brand Pitch",
			"percentage": 50
		}, {
			"color": 1,
			"sequence": 3,
			"max_marks": 2,
			"section": "Recommendations",
			"percentage": 0
		}, {
			"color": 1,
			"sequence": 4,
			"max_marks": 4,
			"section": "Feedback",
			"percentage": 0
		}],
		"store_code": null,
		"store_type": "5 pairs",
		"total_score": {
			"percentage": 73,
			"max_marks": 56,
			"color": 3,
		},
	}];

	it("renders the reports", () => {
		const r = renderer.create(<AuditStoreTable reports={sampleAuditStores} isLoading={false}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders a message when there are no reports", () => {
		const r = renderer.create(<AuditStoreTable reports={[]} isLoading={false}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders a loading widget when the reports are loading", () => {
		const r = renderer.create(<AuditStoreTable reports={[]} isLoading={true}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
