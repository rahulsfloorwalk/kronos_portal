import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import moment from "moment";

import DOBPicker from "../DOBPicker.jsx";

describe("<DOBPicker/>", () => {
	const sampleDate = new Date(1994, 6, 1);

	it("renders a date correctly", () => {
		const tree = renderer.create(<DOBPicker initialDate={sampleDate}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders correctly when no date is given", () => {
		const tree = renderer.create(<DOBPicker initialDate={undefined}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});

	describe("when it is disabled", () => {
		const disabled = true;

		it("renders a date correctly", () => {
			const tree = renderer.create(<DOBPicker initialDate={sampleDate} disabled={disabled}/>).toJSON();
			expect(tree).toMatchSnapshot();
		});

		it("renders correctly when no date is given", () => {
			const tree = renderer.create(<DOBPicker initialDate={undefined} disabled={disabled}/>).toJSON();
			expect(tree).toMatchSnapshot();
		});
	});

	it("renders a date in a leap year correctly", () => {
		const leapYearDate = new Date(2016, 1, 12);
		const tree = renderer.create(<DOBPicker initialDate={leapYearDate}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("calls onChange with the correct date when the day is changed", () => {
		const onChange = jest.fn();
		const r = shallow(<DOBPicker initialDate={sampleDate} onChange={onChange}/>);
		r.find("select").at(2).simulate("change", { target: { value: 5}});
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0].toString()).toEqual(moment(new Date(1994, 6, 5)).toString());
	});

	it("calls onChange with the correct date when the month is changed", () => {
		const onChange = jest.fn();
		const r = shallow(<DOBPicker initialDate={sampleDate} onChange={onChange}/>);
		r.find("select").at(1).simulate("change", { target: { value: 7}});
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0].toString()).toEqual(moment(new Date(1994, 7, 1)).toString());
	});

	it("calls onChange with the correct date when the year is changed", () => {
		const onChange = jest.fn();
		const r = shallow(<DOBPicker initialDate={sampleDate} onChange={onChange}/>);
		r.find("select").at(0).simulate("change", { target: { value: 1997}});
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0].toString()).toEqual(moment(new Date(1997, 6, 1)).toString());
	});

	it("calls onChange with null when the selected date is invalid", () => {
		const validDate = new Date(2016, 4, 31);
		const onChange = jest.fn();
		const r = shallow(<DOBPicker initialDate={validDate} onChange={onChange}/>);
		r.find("select").at(1).simulate("change", { target: { value: 5}});
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0]).toBeNull();
	});
});
