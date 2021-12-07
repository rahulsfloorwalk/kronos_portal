import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import { ProjectAnalyticsMonthWise, ProjectAnalyticsCycleWise } from "../ProjectAnalytics.jsx";
import { getProjectAnalyticYearly, getProjectAnalytic } from "../../../../service/reports.js";

jest.mock("../../../../service/reports.js");

describe("<ProjectAnalyticsMonthWise />", () => {
	const sampleResults = {
		"results": [
			{
				"month": "01",
				"year": "2021",
				"application_count": 0,
				"total_audits": 0,
				"unique_auditors": 0,
				"new_auditor_count": 0
			},
			{
				"month": "02",
				"year": "2021",
				"application_count": 0,
				"total_audits": 0,
				"unique_auditors": 0,
				"new_auditor_count": 0
			},
			{
				"month": "03",
				"year": "2021",
				"application_count": 0,
				"total_audits": 0,
				"unique_auditors": 0,
				"new_auditor_count": 0
			},
			{
				"month": "04",
				"year": "2021",
				"application_count": 0,
				"total_audits": 0,
				"unique_auditors": 0,
				"new_auditor_count": 0
			},
			{
				"month": "05",
				"year": "2021",
				"application_count": 7,
				"total_audits": 15,
				"unique_auditors": 2,
				"new_auditor_count": 2
			},
			{
				"month": "06",
				"year": "2021",
				"application_count": 0,
				"total_audits": 0,
				"unique_auditors": 0,
				"new_auditor_count": 0
			},
			{
				"month": "07",
				"year": "2021",
				"application_count": 0,
				"total_audits": 0,
				"unique_auditors": 0,
				"new_auditor_count": 0
			},
			{
				"month": "08",
				"year": "2021",
				"application_count": 0,
				"total_audits": 0,
				"unique_auditors": 0,
				"new_auditor_count": 0
			},
			{
				"month": "09",
				"year": "2021",
				"application_count": 1,
				"total_audits": 3,
				"unique_auditors": 1,
				"new_auditor_count": 0
			},
			{
				"month": "10",
				"year": "2021",
				"application_count": 3,
				"total_audits": 15,
				"unique_auditors": 2,
				"new_auditor_count": 0
			},
			{
				"month": "11",
				"year": "2021",
				"application_count": 0,
				"total_audits": 10,
				"unique_auditors": 0,
				"new_auditor_count": 0
			},
			{
				"month": "12",
				"year": "2021",
				"application_count": 0,
				"total_audits": 0,
				"unique_auditors": 0,
				"new_auditor_count": 0
			}
		],
	};

	it("is rendered correctly when the data are loading", () => {
		getProjectAnalyticYearly.mockResolvedValue(sampleResults["results"]);
		const r = renderer.create(<ProjectAnalyticsMonthWise />);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when the data is successfully loaded", (done) => {
		getProjectAnalyticYearly.mockResolvedValue(sampleResults["results"]);
		const r = renderer.create(<ProjectAnalyticsMonthWise/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});


describe("<ProjectAnalyticsCycleWise />", () => {
	const sampleResults = {
		"cycles": [
			{
				"client": "Reliance",
				"cycle": "September 2021",
				"manager": [
					"test.manager@floorwalk.in"
				],
				"month": 9,
				"year": "2021",
				"application_count": 1,
				"total_audits": 3,
				"unique_auditors": 1,
				"new_auditor": 0
			},
			{
				"client": "FloorWalk",
				"cycle": "FloorWalk Demo - March 2021",
				"manager": [
					"test1.manager@floorwalk.in",
					"test.manager@floorwalk.in"
				],
				"month": 5,
				"year": "2021",
				"application_count": 7,
				"total_audits": 15,
				"unique_auditors": 2,
				"new_auditor": 2
			},
			{
				"client": "FloorWalk",
				"cycle": "September 2021",
				"manager": [
					"test1.manager@floorwalk.in",
					"test.manager@floorwalk.in"
				],
				"month": 10,
				"year": "2021",
				"application_count": 0,
				"total_audits": 10,
				"unique_auditors": 1,
				"new_auditor": 0
			},
			{
				"client": "FloorWalk",
				"cycle": "PLL Follow Up",
				"manager": [
					"test1.manager@floorwalk.in",
					"test.manager@floorwalk.in"
				],
				"month": 10,
				"year": "2021",
				"application_count": 3,
				"total_audits": 5,
				"unique_auditors": 1,
				"new_auditor": 0
			},
			{
				"client": "Reliance",
				"cycle": "November 2021",
				"manager": [
					"test.manager@floorwalk.in"
				],
				"month": 11,
				"year": "2021",
				"application_count": 0,
				"total_audits": 10,
				"unique_auditors": 0,
				"new_auditor": 0
			}
		]
	};

	it("is rendered correctly when the data are loading", () => {
		getProjectAnalytic.mockResolvedValue(sampleResults["cycles"]);
		const r = renderer.create(<ProjectAnalyticsCycleWise />);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when the data is successfully loaded", (done) => {
		getProjectAnalytic.mockResolvedValue(sampleResults["cycles"]);

		const r = renderer.create(<ProjectAnalyticsCycleWise/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("calls the analytic service correctly", () => {
		getProjectAnalytic.mockResolvedValue(sampleResults["cycles"]);
		shallow(<ProjectAnalyticsCycleWise/>);
		expect(getProjectAnalytic).toBeCalled();
	});

	it("sets the state correctly once data is loaded", (done) => {
		getProjectAnalytic.mockResolvedValue(sampleResults["cycles"]);
		const r = shallow(<ProjectAnalyticsCycleWise/>);
		setTimeout(() => {
			expect(r.state("cycles")).toEqual(sampleResults["cycles"]);
			done();
		});
	});
});
