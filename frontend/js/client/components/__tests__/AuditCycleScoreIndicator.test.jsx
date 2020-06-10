import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import AuditCycleScoreIndicator from "../AuditCycleScoreIndicator.jsx";
// import { fetchAuditCyclesTimeSeries } from "../../service/dashboard.js";
import { fetchAuditCycleScoreList } from "../../service/dashboard.js";


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

const sampleAuditCycleScoreList = [
	{
		"id":1,
		"name": "January 2020",
		"get_total_percentage": 100
	},
	{
		"id":2,
		"name": "March 2020",
		"get_total_percentage": 85
	},
	{
		"id":3,
		"name": "May 2020",
		"get_total_percentage": 90
	}
];

describe("<AuditCycleScoreIndicator/>", () => {
	beforeEach(() => {
		// fetchAuditCyclesTimeSeries.mockReturnValue($.Deferred().resolve(sampleTimeSeriesData).promise());
		fetchAuditCycleScoreList.mockReturnValue($.Deferred().resolve(sampleAuditCycleScoreList).promise());
	});

	it("renders the chart correctly", (done) => {
		const r = renderer.create(<AuditCycleScoreIndicator questionnaireType={sampleQuestionnaireType} />, { createNodeMock });
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
	it("calls fetchAuditCycleScoreList with the correct ID", (done) => {
		shallow(<AuditCycleScoreIndicator questionnaireType={sampleQuestionnaireType} />);
		setTimeout(() => {
			// expect(fetchAuditCyclesTimeSeries).toHaveBeenCalledWith(sampleQuestionnaireType.id);
			expect(fetchAuditCycleScoreList).toHaveBeenCalledWith(sampleQuestionnaireType.id);
			done();
		});
	});
});
