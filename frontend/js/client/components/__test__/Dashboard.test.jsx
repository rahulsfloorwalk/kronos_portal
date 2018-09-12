import React from "react";
import { shallow } from "enzyme";
import $ from "jquery";

import AuditCycleTimeSeries from "../AuditCycleTimeSeries.jsx";
import AuditCycleStorePerformance from "../AuditCycleStorePerformance.jsx";
import DashboardCityPerformanceChart from "../DashboardCityPerformanceChart.jsx";

import { Dashboard } from "../Dashboard.jsx";
import { fetchQuestionnaireTypes } from "../../service/questionnaire_type.js";
jest.mock("../../service/questionnaire_type.js");

const sampleQuestionnaireTypes = [
	{
		"id": 180,
		"name": "Sky Karting",
		"is_default": false,
		"client_id": 9
	},
	{
		"id": 183,
		"name": "Fine Dine",
		"is_default": false,
		"client_id": 9
	},
	{
		"id": 184,
		"name": "Smaaash Arena",
		"is_default": false,
		"client_id": 9
	},
	{
		"id": 213,
		"name": "Walk In",
		"is_default": true,
		"client_id": 9
	}
];

describe("<Dashboard/>", () => {
	it("renders the tab strip with the default type as active", (done) => {
		fetchQuestionnaireTypes.mockReturnValue($.Deferred().resolve(sampleQuestionnaireTypes).promise());
		const r = shallow(<Dashboard/>);
		setTimeout(() => {
			r.update();
			expect(r.find("ul li a").length).toEqual(4);
			expect(r.find("ul li").at(3).hasClass("active")).toEqual(true);
			done();
		});
	});

	it("passes the selected Questionnaire Type to sub charts", (done) => {
		fetchQuestionnaireTypes.mockReturnValue($.Deferred().resolve(sampleQuestionnaireTypes).promise());
		const r = shallow(<Dashboard/>);
		setTimeout(() => {
			r.update();
			const selectedQuestionnaireType = sampleQuestionnaireTypes[3];
			expect(r.find(AuditCycleTimeSeries).prop("questionnaireType")).toEqual(selectedQuestionnaireType);
			expect(r.find(DashboardCityPerformanceChart).prop("questionnaireType")).toEqual(selectedQuestionnaireType);
			expect(r.find(AuditCycleStorePerformance).prop("questionnaireType")).toEqual(selectedQuestionnaireType);
			done();
		});
	});

	it("changes the selected questionnaireType on click", (done) => {
		fetchQuestionnaireTypes.mockReturnValue($.Deferred().resolve(sampleQuestionnaireTypes).promise());
		const r = shallow(<Dashboard/>);
		setTimeout(() => {
			r.update();
			r.find("ul li a").at(1).simulate("click");
			r.update();
			const selectedQuestionnaireType = sampleQuestionnaireTypes[1];
			expect(r.find(AuditCycleTimeSeries).prop("questionnaireType")).toEqual(selectedQuestionnaireType);
			expect(r.find(DashboardCityPerformanceChart).prop("questionnaireType")).toEqual(selectedQuestionnaireType);
			expect(r.find(AuditCycleStorePerformance).prop("questionnaireType")).toEqual(selectedQuestionnaireType);
			done();
		});
	});

	it("calls fetchQuestionnaireTypes", () => {
		fetchQuestionnaireTypes.mockReturnValue($.Deferred().resolve(sampleQuestionnaireTypes).promise());
		shallow(<Dashboard/>);
		expect(fetchQuestionnaireTypes).toHaveBeenCalled();
	});

	it("does not render tab strip when only a single questionnaire type is returned", (done) => {
		fetchQuestionnaireTypes.mockReturnValue($.Deferred().resolve([sampleQuestionnaireTypes[0]]).promise());
		const r = shallow(<Dashboard/>);
		setTimeout(() => {
			r.update();
			expect(r.find("ul").length).toEqual(0);
			done();
		});
	});
});
