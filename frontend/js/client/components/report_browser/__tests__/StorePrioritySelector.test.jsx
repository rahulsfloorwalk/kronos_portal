import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { StorePrioritySelector } from "../StorePrioritySelector";

const sampleStorePriorities = [ "HIGH", "MEDIUM", "LOW", ];

describe(StorePrioritySelector, () => {
	it("renders the selector with nothing selected", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StorePrioritySelector
			onSelect={onSelect}
			storePriorities={sampleStorePriorities}
			selectedStorePriority={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders nothing when there are no priorities", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StorePrioritySelector
			onSelect={onSelect}
			storePriorities={[]}
			selectedStorePriority={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the selector with selected store_priority", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StorePrioritySelector
			onSelect={onSelect}
			storePriorities={sampleStorePriorities}
			selectedStorePriority={sampleStorePriorities[0]}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onSelect with the store_priority when a store_priority is selected", () => {
		const onSelect = jest.fn();
		const r = shallow(<StorePrioritySelector
			onSelect={onSelect}
			storePriorities={sampleStorePriorities}
			selectedStorePriority={sampleStorePriorities[0]}
		/>);

		r.find("select").simulate("change", { target: { value: String(sampleStorePriorities[2]) }});
		expect(onSelect).toHaveBeenCalledWith("LOW");
	});
});
