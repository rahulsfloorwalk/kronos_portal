import React from "react";
import renderer from "react-test-renderer";

import SectionTotalsBox from "../SectionTotalsBox.jsx";

const sampleSections = [
	{
		"id": 734,
		"name": "Visit details",
		"audit_cycle": 96,
		"sequence": 1,
		"max_marks": 0
	},
	{
		"id": 735,
		"name": "Telephonic Interaction",
		"audit_cycle": 96,
		"sequence": 2,
		"max_marks": 11
	},
	{
		"id": 736,
		"name": "Outside Area",
		"audit_cycle": 96,
		"sequence": 3,
		"max_marks": 7
	},
	{
		"id": 737,
		"name": "Cash Counter and Entrance Lobby",
		"audit_cycle": 96,
		"sequence": 4,
		"max_marks": 17
	},
	{
		"id": 738,
		"name": "Customer service and Grooming",
		"audit_cycle": 96,
		"sequence": 5,
		"max_marks": 10
	},
	{
		"id": 739,
		"name": "Food & Beverage",
		"audit_cycle": 96,
		"sequence": 6,
		"max_marks": 28
	},
	{
		"id": 740,
		"name": "Gaming Equipment and Experience",
		"audit_cycle": 96,
		"sequence": 7,
		"max_marks": 11
	},
	{
		"id": 742,
		"name": "Cricket Lane",
		"audit_cycle": 96,
		"sequence": 8,
		"max_marks": 13
	},
	{
		"id": 741,
		"name": "Super Keeper",
		"audit_cycle": 96,
		"sequence": 9,
		"max_marks": 7
	},
	{
		"id": 743,
		"name": "Twilight Bowling",
		"audit_cycle": 96,
		"sequence": 10,
		"max_marks": 7
	},
	{
		"id": 744,
		"name": "Laser Blast",
		"audit_cycle": 96,
		"sequence": 11,
		"max_marks": 13
	},
	{
		"id": 745,
		"name": "VR Game 1",
		"audit_cycle": 96,
		"sequence": 12,
		"max_marks": 8
	},
	{
		"id": 746,
		"name": "VR Game 2",
		"audit_cycle": 96,
		"sequence": 13,
		"max_marks": 8
	},
	{
		"id": 747,
		"name": "Sky Karting",
		"audit_cycle": 96,
		"sequence": 14,
		"max_marks": 12
	},
	{
		"id": 748,
		"name": "Sales Team Audit",
		"audit_cycle": 96,
		"sequence": 15,
		"max_marks": 10
	},
	{
		"id": 749,
		"name": "Washrooms",
		"audit_cycle": 96,
		"sequence": 16,
		"max_marks": 6
	}
];

const sampleReportSections = [
	{
		"id": 8748,
		"audit_store": 2113,
		"section": 744,
		"not_applicable": true,
		"marks_obtained": 0,
		"max_marks": 0,
		"marks_percentage": 0,
		"color_code": 0
	},
	{
		"id": 8751,
		"audit_store": 2113,
		"section": 747,
		"not_applicable": true,
		"marks_obtained": 0,
		"max_marks": 0,
		"marks_percentage": 0,
		"color_code": 0
	},
	{
		"id": 8742,
		"audit_store": 2113,
		"section": 738,
		"not_applicable": false,
		"marks_obtained": 10,
		"max_marks": 10,
		"marks_percentage": 100,
		"color_code": 4
	},
	{
		"id": 8745,
		"audit_store": 2113,
		"section": 742,
		"not_applicable": false,
		"marks_obtained": 8,
		"max_marks": 11,
		"marks_percentage": 72.72727272727273,
		"color_code": 3
	},
	{
		"id": 8752,
		"audit_store": 2113,
		"section": 748,
		"not_applicable": false,
		"marks_obtained": 9,
		"max_marks": 10,
		"marks_percentage": 90,
		"color_code": 4
	},
	{
		"id": 8749,
		"audit_store": 2113,
		"section": 745,
		"not_applicable": false,
		"marks_obtained": 8,
		"max_marks": 8,
		"marks_percentage": 100,
		"color_code": 4
	},
	{
		"id": 8740,
		"audit_store": 2113,
		"section": 736,
		"not_applicable": false,
		"marks_obtained": 5,
		"max_marks": 7,
		"marks_percentage": 71.42857142857143,
		"color_code": 3
	},
	{
		"id": 8743,
		"audit_store": 2113,
		"section": 739,
		"not_applicable": false,
		"marks_obtained": 16,
		"max_marks": 28,
		"marks_percentage": 57.142857142857146,
		"color_code": 2
	},
	{
		"id": 8744,
		"audit_store": 2113,
		"section": 740,
		"not_applicable": false,
		"marks_obtained": 7,
		"max_marks": 11,
		"marks_percentage": 63.63636363636363,
		"color_code": 3
	},
	{
		"id": 8750,
		"audit_store": 2113,
		"section": 746,
		"not_applicable": false,
		"marks_obtained": 8,
		"max_marks": 8,
		"marks_percentage": 100,
		"color_code": 4
	},
	{
		"id": 8747,
		"audit_store": 2113,
		"section": 743,
		"not_applicable": false,
		"marks_obtained": 7,
		"max_marks": 7,
		"marks_percentage": 100,
		"color_code": 4
	},
	{
		"id": 8739,
		"audit_store": 2113,
		"section": 735,
		"not_applicable": false,
		"marks_obtained": 11,
		"max_marks": 11,
		"marks_percentage": 100,
		"color_code": 4
	},
	{
		"id": 8753,
		"audit_store": 2113,
		"section": 749,
		"not_applicable": false,
		"marks_obtained": 6,
		"max_marks": 6,
		"marks_percentage": 100,
		"color_code": 4
	},
	{
		"id": 8738,
		"audit_store": 2113,
		"section": 734,
		"not_applicable": false,
		"marks_obtained": 0,
		"max_marks": 0,
		"marks_percentage": 0,
		"color_code": 0
	},
	{
		"id": 8741,
		"audit_store": 2113,
		"section": 737,
		"not_applicable": false,
		"marks_obtained": 15,
		"max_marks": 17,
		"marks_percentage": 88.23529411764706,
		"color_code": 4
	},
	{
		"id": 8746,
		"audit_store": 2113,
		"section": 741,
		"not_applicable": false,
		"marks_obtained": 5,
		"max_marks": 7,
		"marks_percentage": 71.42857142857143,
		"color_code": 3
	}
];

describe("<SectionTotalsBox/>", () => {
	it("renders the SectionTotalsBox correctly", () => {
		const r = renderer.create(<SectionTotalsBox sections={sampleSections} reportSections={sampleReportSections}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
