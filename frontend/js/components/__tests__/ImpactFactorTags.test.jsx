import React from "react";
import renderer from "react-test-renderer";

import ImpactFactorTags from "../ImpactFactorTags.jsx";

describe(ImpactFactorTags, () => {
	let impactFactors;
	describe("when there are no impact factors", () => {
		beforeEach(() => {
			impactFactors = [];
		});
		it("renders nothing", () => {
			const r = renderer.create(<ImpactFactorTags impactFactors={impactFactors} />);
			expect(r.toJSON()).toMatchSnapshot();
		});
	});

	describe("when there some impact factors", () => {
		beforeEach(() => {
			impactFactors = ["Shell", "British", "Hindustan"];
		});
		it("renders the tags for every impact factor", () => {
			const r = renderer.create(<ImpactFactorTags impactFactors={impactFactors} />);
			expect(r.toJSON()).toMatchSnapshot();
		});
	});
});
