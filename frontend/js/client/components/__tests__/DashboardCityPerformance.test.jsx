import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import DashboardCityPerformanceChart from "../DashboardCityPerformanceChart.jsx";
// import { fetchCityWisePerformance } from "../../service/dashboard.js";
import { fetchCityWisePerformanceByAuditCycleId } from "../../service/dashboard.js";

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

const sampleAuditCycle = {
	"id":1,
	"name": "January 2017",
	"start_date": "2017-01-01",
	"end_date": "2017-01-31",
	"type": "walk in"
};

const sampleCityPerformanceData = {
	"type": "1",
	"questionnaire_type": "1",
	"columns": [
		"January 2017",
		/* "February 2017",
		"March 2017" */
	],
	"data": [
		[
			{
				"id": 582,
				"name": "Lucknow"
			},
			[
				{
					"color_code": 1,
					"value": 32
				},
				/* {
					"color_code": 2,
					"value": 60
				},
				{
					"color_code": 3,
					"value": 72
				} */
			]
		],
		[
			{
				"id": 650,
				"name": "Delhi"
			},
			[
				{
					"color_code": 1,
					"value": 24
				},
				/* {
					"color_code": 2,
					"value": 43
				},
				{
					"color_code": 3,
					"value": 66
				} */
			]
		],
		[
			{
				"id": 641,
				"name": "Bangalore"
			},
			[
				{
					"color_code": 3,
					"value": 76
				},
				/* {
					"color_code": 1,
					"value": 40
				},
				{
					"color_code": 2,
					"value": 60
				} */
			]
		],
		[
			{
				"id": 631,
				"name": "Kolkata"
			},
			[
				{
					"color_code": 2,
					"value": 54
				},
				/* {
					"color_code": 3,
					"value": 64
				},
				{
					"color_code": 2,
					"value": 58
				} */
			]
		],
		[
			{
				"id": 3,
				"name": "Mumbai"
			},
			[
				{
					"color_code": 1,
					"value": 36
				},
				/* {
					"color_code": 1,
					"value": 40
				},
				{
					"color_code": 2,
					"value": 56
				} */
			]
		],
		[
			{
				"id": 9,
				"name": "Hyderabad"
			},
			[
				{
					"color_code": 3,
					"value": 72
				},
				/* {
					"color_code": 2,
					"value": 48
				},
				{
					"color_code": 2,
					"value": 56
				} */
			]
		],
		[
			{
				"id": 296,
				"name": "Bhopal"
			},
			[
				{
					"color_code": 1,
					"value": 40
				},
				/* {
					"color_code": 2,
					"value": 56
				},
				{
					"color_code": 2,
					"value": 48
				} */
			]
		]
	]
};

describe("<DashboardCityPerformanceChart/>", () => {
	beforeEach(() => {
		// fetchCityWisePerformance.mockReturnValue($.Deferred().resolve(sampleCityPerformanceData).promise());
		fetchCityWisePerformanceByAuditCycleId.mockReturnValue($.Deferred().resolve(sampleCityPerformanceData).promise());
	});

	it("renders the chart correctly", (done) => {
		const r = renderer.create(<DashboardCityPerformanceChart questionnaireType={sampleQuestionnaireType} auditCycle={sampleAuditCycle}/>, { createNodeMock });
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
	it("calls fetchCityWisePerformance with the correct ID", (done) => {
		shallow(<DashboardCityPerformanceChart questionnaireType={sampleQuestionnaireType} auditCycle={sampleAuditCycle}/>);
		setTimeout(() => {
			// expect(fetchCityWisePerformance).toHaveBeenCalledWith(sampleQuestionnaireType.id);
			expect(fetchCityWisePerformanceByAuditCycleId).toHaveBeenCalledWith(sampleQuestionnaireType.id, sampleAuditCycle.id);
			done();
		});
	});
});
