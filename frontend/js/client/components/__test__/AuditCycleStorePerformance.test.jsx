import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import AuditCycleStorePerformance from "../AuditCycleStorePerformance.jsx";
import { fetchStoreWisePerformance } from "../../service/dashboard.js";

jest.mock("../../service/dashboard.js");

function createNodeMock() {
	const doc = document.implementation.createHTMLDocument();
	return { parentElement: doc.body };
}

const sampleQuestionnaireType = {
	"id": 1,
	"name": "Walk In",
	"is_default": true,
	"client_id": 1
};

const sampleStorePerformanceData = {
	"type": "1",
	"questionnaire_type": "1",
	"columns": [
		"January 2017",
		"February 2017",
		"March 2017"
	],
	"data": [
		[
			{
				"id": 7,
				"name": "Showroom 7",
				"address": "Near city park",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 650,
					"name": "Delhi"
				}
			},
			[
				{
					"color_code": 1,
					"value": 28
				},
				{
					"color_code": 2,
					"value": 56
				},
				{
					"color_code": 4,
					"value": 92
				}
			]
		],
		[
			{
				"id": 10,
				"name": "Showroom 10",
				"address": "VIP road",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 631,
					"name": "Kolkata"
				}
			},
			[
				{
					"color_code": 3,
					"value": 64
				},
				{
					"color_code": 3,
					"value": 76
				},
				{
					"color_code": 3,
					"value": 80
				}
			]
		],
		[
			{
				"id": 1,
				"name": "Showroom 1",
				"address": "Near Janakpuri metro station",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 650,
					"name": "Delhi"
				}
			},
			[
				{
					"color_code": 1,
					"value": 28
				},
				{
					"color_code": 2,
					"value": 52
				},
				{
					"color_code": 3,
					"value": 74
				}
			]
		],
		[
			{
				"id": 11,
				"name": "Showroom 11",
				"address": "Adarsh nagar",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 582,
					"name": "Lucknow"
				}
			},
			[
				{
					"color_code": 1,
					"value": 32
				},
				{
					"color_code": 2,
					"value": 60
				},
				{
					"color_code": 3,
					"value": 72
				}
			]
		],
		[
			{
				"id": 4,
				"name": "Showroom 4",
				"address": "Near ITPL",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 641,
					"name": "Bangalore"
				}
			},
			[
				{
					"color_code": 3,
					"value": 76
				},
				{
					"color_code": 1,
					"value": 40
				},
				{
					"color_code": 2,
					"value": 60
				}
			]
		],
		[
			{
				"id": 6,
				"name": "Showroom 6",
				"address": "Near Metro pillar number 550",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 650,
					"name": "Delhi"
				}
			},
			[
				{
					"color_code": 1,
					"value": 28
				},
				{
					"color_code": 1,
					"value": 40
				},
				{
					"color_code": 2,
					"value": 60
				}
			]
		],
		[
			{
				"id": 2,
				"name": "Showroom 2",
				"address": "Near Andheri railway station",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 3,
					"name": "Mumbai"
				}
			},
			[
				{
					"color_code": 1,
					"value": 36
				},
				{
					"color_code": 1,
					"value": 40
				},
				{
					"color_code": 2,
					"value": 56
				}
			]
		],
		[
			{
				"id": 3,
				"name": "Showroom 3",
				"address": "Near bus stop",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 9,
					"name": "Hyderabad"
				}
			},
			[
				{
					"color_code": 3,
					"value": 72
				},
				{
					"color_code": 2,
					"value": 48
				},
				{
					"color_code": 2,
					"value": 56
				}
			]
		],
		[
			{
				"id": 8,
				"name": "Showroom 8",
				"address": "Near Press Complex Zone 1",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 296,
					"name": "Bhopal"
				}
			},
			[
				{
					"color_code": 1,
					"value": 40
				},
				{
					"color_code": 2,
					"value": 56
				},
				{
					"color_code": 2,
					"value": 48
				}
			]
		],
		[
			{
				"id": 5,
				"name": "Showroom 5",
				"address": "Near Rajeev Chowk metro station",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 650,
					"name": "Delhi"
				}
			},
			[
				{
					"color_code": 1,
					"value": 12
				},
				{
					"color_code": 1,
					"value": 24
				},
				{
					"color_code": 1,
					"value": 40
				}
			]
		],
		[
			{
				"id": 9,
				"name": "Showroom 9",
				"address": "Barrackpore Trunk Road",
				"type": "",
				"code": null,
				"priority": "",
				"city": {
					"id": 631,
					"name": "Kolkata"
				}
			},
			[
				{
					"color_code": 2,
					"value": 44
				},
				{
					"color_code": 2,
					"value": 52
				},
				{
					"color_code": 1,
					"value": 36
				}
			]
		]
	]
};

describe("<AuditCycleStorePerformance/>", () => {
	beforeEach(() => {
		fetchStoreWisePerformance.mockReturnValue($.Deferred().resolve(sampleStorePerformanceData).promise());
	});

	it("renders the chart correctly", (done) => {
		const r = renderer.create(<AuditCycleStorePerformance questionnaireType={sampleQuestionnaireType}/>, { createNodeMock });
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
	it("calls fetchStoreWisePerformance with the correct ID", (done) => {
		shallow(<AuditCycleStorePerformance questionnaireType={sampleQuestionnaireType}/>);
		setTimeout(() => {
			expect(fetchStoreWisePerformance).toHaveBeenCalledWith(sampleQuestionnaireType.id);
			done();
		});
	});
});
