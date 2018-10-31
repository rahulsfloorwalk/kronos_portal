import React from "react";
import Datetime from "react-datetime";
import moment from "moment";
import { shallow } from "enzyme";
import ShallowRenderer from "react-test-renderer/shallow";
import $ from "jquery";

import { ReportBrowser3 } from "../ReportBrowser3";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

const sampleAuditCycles = [
	{
		"id":109,
		"start_date":"2018-03-12",
		"end_date":"2018-05-31",
		"name":"Wave-1- 2018",
		"type":"WALKIN",
	},
	{
		"id":129,
		"start_date":"2018-03-12",
		"end_date":"2018-05-31",
		"name":"Wave-1- 2018",
		"type":"WALKIN",
	},
];

const sampleReports = [
	{
		"id": 1,
	}, {
		"id": 2,
	},
];

describe("ReportBrowser3", () => {
	var renderer;
	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	it("calls fetchReportsByAuditCycleId when it is mounted", () => {
		const fetchReportsByAuditCycleId = jest.fn();
		const fetchUser = jest.fn();
		shallow(<ReportBrowser3
			fetchReportsByAuditCycleId={fetchReportsByAuditCycleId}
			auditCycles={sampleAuditCycles}
			reports={sampleReports}
			isClientAdmin={true}
			fetchUser={fetchUser}
			selectedAuditCycle={sampleAuditCycles[1]}/>);
		expect(fetchReportsByAuditCycleId).toBeCalledWith(sampleAuditCycles[1].id);
	});

	it("calls fetchReportsByAuditCycleId when selected cycle changes", () => {
		const fetchReportsByAuditCycleId = jest.fn();
		const fetchUser = jest.fn();
		const r = shallow(<ReportBrowser3
			fetchReportsByAuditCycleId={fetchReportsByAuditCycleId}
			auditCycles={sampleAuditCycles}
			reports={sampleReports}
			isClientAdmin={true}
			fetchUser={fetchUser}
			selectedAuditCycle={sampleAuditCycles[1]}/>);
		expect(fetchReportsByAuditCycleId).toBeCalledWith(sampleAuditCycles[1].id);
		r.setProps({
			selectedAuditCycle: sampleAuditCycles[0],
		});
		expect(fetchReportsByAuditCycleId).lastCalledWith(sampleAuditCycles[0].id);
	});

	it("renders the audit store table with correct props", () => {
		const fetchReportsByAuditCycleId = jest.fn();
		const fetchUser = jest.fn();
		const tree = renderer.render(<ReportBrowser3
			fetchReportsByAuditCycleId={fetchReportsByAuditCycleId}
			auditCycles={sampleAuditCycles}
			reports={sampleReports}
			isClientAdmin={true}
			fetchUser={fetchUser}
			selectedAuditCycle={sampleAuditCycles[1]}/>);
		expect(tree).toMatchSnapshot();
	});

	it("does not render the report attribute filters when the user is not a client admin", () => {
		const fetchReportsByAuditCycleId = jest.fn();
		const fetchUser = jest.fn();
		const tree = renderer.render(<ReportBrowser3
			fetchReportsByAuditCycleId={fetchReportsByAuditCycleId}
			auditCycles={sampleAuditCycles}
			reports={sampleReports}
			isClientAdmin={false}
			fetchUser={fetchUser}
			selectedAuditCycle={sampleAuditCycles[1]}/>);
		expect(tree).toMatchSnapshot();
	});

	it("renders a message when there are no audit cycles", () => {
		const fetchReportsByAuditCycleId = jest.fn();
		const fetchUser = jest.fn();
		const tree = renderer.render(<ReportBrowser3
			fetchReportsByAuditCycleId={fetchReportsByAuditCycleId}
			auditCycles={[]}
			reports={[]}
			isClientAdmin={true}
			fetchUser={fetchUser}
			selectedAuditCycle={undefined}/>);
		expect(tree).toMatchSnapshot();
	});

	it("renders a loading widget when no cycle is selected", () => {
		const fetchReportsByAuditCycleId = jest.fn();
		const fetchUser = jest.fn();
		const tree = renderer.render(<ReportBrowser3
			fetchReportsByAuditCycleId={fetchReportsByAuditCycleId}
			auditCycles={sampleAuditCycles}
			reports={[]}
			isClientAdmin={true}
			fetchUser={fetchUser}
			selectedAuditCycle={undefined}/>);
		expect(tree).toMatchSnapshot();
	});
});

