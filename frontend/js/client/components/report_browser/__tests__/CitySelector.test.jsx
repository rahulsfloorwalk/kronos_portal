import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { CitySelector } from "../CitySelector";

const sampleCities = [
	{
		id: 1,
		name: "Mumbai",
	},
	{
		id: 2,
		name: "Nagpur",
	},
	{
		id: 3,
		name: "Bangalore",
	},
];

describe(CitySelector, () => {
	it("renders the selector with nothing selected", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<CitySelector
			onSelect={onSelect}
			cities={sampleCities}
			selectedCityId={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders nothing when there is only one city", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<CitySelector
			onSelect={onSelect}
			cities={[...sampleCities[0]]}
			selectedCityId={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders nothing when there are no cities", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<CitySelector
			onSelect={onSelect}
			cities={[]}
			selectedCityId={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the selector with selected city", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<CitySelector
			onSelect={onSelect}
			cities={sampleCities}
			selectedCityId={sampleCities[0].id}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onSelect with the city id when a city is selected", () => {
		const onSelect = jest.fn();
		const r = shallow(<CitySelector
			onSelect={onSelect}
			cities={sampleCities}
			selectedCityId={sampleCities[0].id}
		/>);

		r.find("select").simulate("change", { target: { value: String(sampleCities[2].id) }});
		expect(onSelect).toHaveBeenCalledWith(3);
	});
});
