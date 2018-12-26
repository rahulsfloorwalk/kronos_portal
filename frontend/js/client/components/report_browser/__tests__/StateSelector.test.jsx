import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import { StateSelector } from "../StateSelector";

const sampleStates = ["Karnataka", "Maharashtra"];

describe("StateSelector", () => {
	it("renders the selector with nothing selected", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StateSelector
			onSelect={onSelect}
			states={sampleStates}
			selectedState={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders nothing when there is only one state", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StateSelector
			onSelect={onSelect}
			states={[...sampleStates[0]]}
			selectedState={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders nothing when there are no states", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StateSelector
			onSelect={onSelect}
			states={[]}
			selectedState={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the selector with selected city", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StateSelector
			onSelect={onSelect}
			states={sampleStates}
			selectedState={sampleStates[0]}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onSelect with the city id when a city is selected", () => {
		const onSelect = jest.fn();
		const r = shallow(<StateSelector
			onSelect={onSelect}
			states={sampleStates}
			selectedState={sampleStates[0]}
		/>);

		r.find("select").simulate("change", { target: { value: String(sampleStates[1]) }});
		expect(onSelect).toHaveBeenCalledWith("Maharashtra");
	});
});
