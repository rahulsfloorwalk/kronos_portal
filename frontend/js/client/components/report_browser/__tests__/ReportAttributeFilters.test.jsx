import React from "react";
import { shallow } from "enzyme";
import ShallowRenderer from "react-test-renderer/shallow";

import { ReportAttributeFilters } from "../ReportAttributeFilters";

const sampleAuditCycle = {
	"id":129,
	"start_date":"2018-03-12",
	"end_date":"2018-05-31",
	"name":"Wave-1- 2018",
	"type":"WALKIN",
};

const sampleReportAttributes = [
	{
		id: 1,
		json_id: "attribute1",
		label: "Label One",
		attribute_data: {
			version: 1,
			options: [
				{
					option_id: "option1",
					option_label: "Option Label 1",
				},
				{
					option_id: "option2",
					option_label: "Option Label 2",
				},
			],
		},
	},
	{
		id: 2,
		json_id: "attribute2",
		label: "Label Two",
		attribute_data: {
			version: 1,
			options: [
				{
					option_id: "option1",
					option_label: "Option Label 1",
				},
				{
					option_id: "option2",
					option_label: "Option Label 2",
				},
			],
		},
	},
];

describe("ReportAttributeFilters", () => {
	let renderer;
	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	it("calls fetchReportAttributesByAuditCycleId when it is mounted", () => {
		const fetchReportAttributesByAuditCycleId = jest.fn();
		shallow(<ReportAttributeFilters
			fetchReportAttributesByAuditCycleId={fetchReportAttributesByAuditCycleId}
			reportAttributes={sampleReportAttributes}
			selectedAuditCycle={sampleAuditCycle}/>);
		expect(fetchReportAttributesByAuditCycleId).toBeCalledWith(sampleAuditCycle.id);
	});

	it("calls fetchReportAttributesByAuditCycleId when selected cycle changes", () => {
		const fetchReportAttributesByAuditCycleId = jest.fn();
		const r = shallow(<ReportAttributeFilters
			fetchReportAttributesByAuditCycleId={fetchReportAttributesByAuditCycleId}
			reportAttributes={sampleReportAttributes}
			selectedAuditCycle={sampleAuditCycle}/>);
		expect(fetchReportAttributesByAuditCycleId).toBeCalledWith(sampleAuditCycle.id);
		const expectedAuditCycleId = 5;
		r.setProps({
			selectedAuditCycle: Object.assign({}, sampleAuditCycle, { id: expectedAuditCycleId }),
		});
		expect(fetchReportAttributesByAuditCycleId).lastCalledWith(expectedAuditCycleId);
	});

	it("renders the report attribute filters with correct props", () => {
		const fetchReportAttributesByAuditCycleId = jest.fn();
		const tree = renderer.render(<ReportAttributeFilters
			fetchReportAttributesByAuditCycleId={fetchReportAttributesByAuditCycleId}
			reportAttributes={sampleReportAttributes}
			selectedAuditCycle={sampleAuditCycle}/>);
		expect(tree).toMatchSnapshot();
	});

	it("renders nothing when there are no report attributes", () => {
		const fetchReportAttributesByAuditCycleId = jest.fn();
		const tree = renderer.render(<ReportAttributeFilters
			fetchReportAttributesByAuditCycleId={fetchReportAttributesByAuditCycleId}
			reportAttributes={[]}
			selectedAuditCycle={undefined}/>);
		expect(tree).toMatchSnapshot();
	});
});

