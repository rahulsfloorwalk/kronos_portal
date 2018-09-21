import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import moment from "moment";
import Datetime from "react-datetime";

import { StartDateSelector } from "../StartDateSelector";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

describe(StartDateSelector, () => {
	it("renders the selector with a given start_date", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<StartDateSelector
			onSelect={onSelect}
			selectedStartDate="2018-07-15"
			min="2018-07-01"
			max="2018-07-30"
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onSelect with the start_date when a start_date is selected", () => {
		const onSelect = jest.fn();
		const r = shallow(<StartDateSelector
			onSelect={onSelect}
			selectedStartDate="2018-07-15"
			min="2018-07-01"
			max="2018-07-30"
		/>);

		r.find(Datetime).simulate("change", moment("2018-07-15"));
		expect(onSelect).toHaveBeenCalledWith("2018-07-15");
	});
});
