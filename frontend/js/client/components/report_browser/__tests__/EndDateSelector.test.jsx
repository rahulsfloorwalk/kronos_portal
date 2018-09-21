import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import moment from "moment";
import Datetime from "react-datetime";

import { EndDateSelector } from "../EndDateSelector";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

describe(EndDateSelector, () => {
	it("renders the selector with a given end_date", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<EndDateSelector
			onSelect={onSelect}
			selectedEndDate="2018-07-15"
			min="2018-07-01"
			max="2018-07-30"
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onSelect with the end_date when a end_date is selected", () => {
		const onSelect = jest.fn();
		const r = shallow(<EndDateSelector
			onSelect={onSelect}
			selectedEndDate="2018-07-15"
			min="2018-07-01"
			max="2018-07-30"
		/>);

		r.find(Datetime).simulate("change", moment("2018-07-15"));
		expect(onSelect).toHaveBeenCalledWith("2018-07-15");
	});
});
