import React from "react";
import renderer from "react-test-renderer";

import ImpactFactorBox from "../ImpactFactorBox.jsx";

const sampleImpactFactors = [
	{
		"name": "Customer Experience",
		"marks_obtained": 15,
		"total_marks": 100,
		"percentage": 15
	},
	{
		"name": "Brand Value",
		"marks_obtained": 35,
		"total_marks": 100,
		"percentage": 35
	},
	{
		"name": "Staff Interaction",
		"marks_obtained": 55,
		"total_marks": 100,
		"percentage": 55
	},
	{
		"name": "Product positioning",
		"marks_obtained": 75,
		"total_marks": 100,
		"percentage": 75
	},
	{
		"name": "WOW Factor",
		"marks_obtained": 95,
		"total_marks": 100,
		"percentage": 95
	},
];

describe("<ImpactFactorBox/>", () => {
	it("renders the ImpactFactorBox correctly", () => {
		const r = renderer.create(<ImpactFactorBox impactFactors={sampleImpactFactors}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
