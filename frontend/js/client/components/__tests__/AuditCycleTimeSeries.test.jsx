import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import AuditCycleTimeSeries from "../AuditCycleTimeSeries.jsx";
import { fetchAuditCyclesTimeSeries } from "../../service/dashboard.js";

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

const sampleTimeSeriesData = {
	"title": "Audit Cycle Summary",
	"audit_cycle_master": [
		"January 2017",
		"February 2017",
		"March 2017"
	],
	"section_master": [
		"Entrance",
		"Need Analysis",
		"Staff Analysis",
		"Selling and Recommendation skills",
		"Outlet analysis"
	],
	"values": [
		[
			{
				"color_code": 1,
				"value": 36
			},
			{
				"color_code": 1,
				"value": 32
			},
			{
				"color_code": 2,
				"value": 47
			},
			{
				"color_code": 1,
				"value": 30
			},
			{
				"color_code": 3,
				"value": 61
			}
		],
		[
			{
				"color_code": 2,
				"value": 45
			},
			{
				"color_code": 2,
				"value": 49
			},
			{
				"color_code": 2,
				"value": 56
			},
			{
				"color_code": 2,
				"value": 43
			},
			{
				"color_code": 2,
				"value": 52
			}
		],
		[
			{
				"color_code": 3,
				"value": 68
			},
			{
				"color_code": 2,
				"value": 60
			},
			{
				"color_code": 3,
				"value": 66
			},
			{
				"color_code": 2,
				"value": 46
			},
			{
				"color_code": 3,
				"value": 70
			}
		]
	]
};

describe("<AuditCycleTimeSeries/>", () => {
	beforeEach(() => {
		fetchAuditCyclesTimeSeries.mockReturnValue($.Deferred().resolve(sampleTimeSeriesData).promise());
	});

	it("renders the chart correctly", (done) => {
		const r = renderer.create(<AuditCycleTimeSeries questionnaireType={sampleQuestionnaireType}/>, { createNodeMock });
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
	it("calls fetchAuditCyclesTimeSeries with the correct ID", (done) => {
		shallow(<AuditCycleTimeSeries questionnaireType={sampleQuestionnaireType}/>);
		setTimeout(() => {
			expect(fetchAuditCyclesTimeSeries).toHaveBeenCalledWith(sampleQuestionnaireType.id);
			done();
		});
	});

	it("renders the data popup correctly when the button is clicked", (done) => {
		const r = renderer.create(<AuditCycleTimeSeries questionnaireType={sampleQuestionnaireType}/>, { createNodeMock });
		setTimeout(() => {
			r.getInstance().setState({ dataPopup: true });
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});
