import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import ImpactFactorInput from "../ImpactFactorInput.jsx";

describe(ImpactFactorInput, () => {

	let onChange;
	beforeEach(() => {
		onChange = jest.fn();
	});

	it("renders an empty form", () => {
		const r = renderer.create(<ImpactFactorInput
			onChange={onChange}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders a pre filled form", () => {
		const sampleTags = ["Einstein", "Newton"];

		const r = renderer.create(<ImpactFactorInput
			impactFactors={sampleTags}
			onChange={onChange}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onChange with the split values", () => {
		const actualInput = "Einstein, Newton";
		const expectedTags = ["Einstein", "Newton"];

		const r = shallow(<ImpactFactorInput
			impactFactors={[]}
			onChange={onChange}
		/>);
		r.find("input").simulate("change", {
			target: { value: actualInput },
		});
		expect(onChange).toBeCalledWith(expectedTags);
	});
});
