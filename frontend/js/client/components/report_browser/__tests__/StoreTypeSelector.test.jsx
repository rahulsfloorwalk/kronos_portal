import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { StoreTypeSelector } from "../StoreTypeSelector";

const sampleStoreTypes = [ "Factory Outlet", "Express Store", "Retail Outlet", ];

describe(StoreTypeSelector, () => {
	it("renders the selector with nothing selected", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StoreTypeSelector
			onSelect={onSelect}
			storeTypes={sampleStoreTypes}
			selectedStoreType={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders nothing when the types are less than two", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StoreTypeSelector
			onSelect={onSelect}
			storeTypes={[]}
			selectedStoreType={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the selector with selected store_type", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StoreTypeSelector
			onSelect={onSelect}
			storeTypes={sampleStoreTypes}
			selectedStoreType={sampleStoreTypes[0]}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onSelect with the store_type when a store_type is selected", () => {
		const onSelect = jest.fn();
		const r = shallow(<StoreTypeSelector
			onSelect={onSelect}
			storeTypes={sampleStoreTypes}
			selectedStoreType={sampleStoreTypes[0]}
		/>);

		r.find("select").simulate("change", { target: { value: String(sampleStoreTypes[2]) }});
		expect(onSelect).toHaveBeenCalledWith("Retail Outlet");
	});
});
