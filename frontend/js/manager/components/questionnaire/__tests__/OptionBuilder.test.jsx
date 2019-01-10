import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import OptionBuilder from "../OptionBuilder.jsx";

describe(OptionBuilder, () => {
	let onChange;
	let sampleOptions;
	beforeEach(() => {
		onChange = jest.fn();
	});

	describe("when there are no options specified", () => {
		beforeEach(() => {
			sampleOptions = [];
		});

		it("renders default options", () => {
			const r = renderer.create(<OptionBuilder
				options={sampleOptions}
				onChange={onChange}
			/>);
			expect(r.toJSON()).toMatchSnapshot();
		});
	});

	describe("when there are options specified", () => {
		beforeEach(() => {
			sampleOptions = [
				{
					sequence: 1,
					value: "Good",
					marks: 2,
				}, {
					sequence: 2,
					value: "Bad",
					marks: 1,
				},
			];
		});

		it("renders given options", () => {
			const r = renderer.create(<OptionBuilder
				options={sampleOptions}
				onChange={onChange}
			/>);
			expect(r.toJSON()).toMatchSnapshot();
		});
	});

	describe("when the add button is pressed", () => {
		let r;
		beforeEach(() => {
			r = shallow(<OptionBuilder
				options={sampleOptions}
				onChange={onChange}
			/>);
			r.find("button").at(0).simulate("click");
		});

		it("adds another option row", () => {
			expect(r.find("tbody > tr")).toHaveLength(3);
		});

		it("increments the sequence", () => {
			expect(r.find("tbody > tr").at(2).find("input").at(0).prop("value")).toEqual(3);
		});

		it("adds empty option", () => {
			expect(r.find("tbody > tr").at(2).find("input").at(1).prop("value")).toEqual("");
		});

		it("adds zero marks", () => {
			expect(r.find("tbody > tr").at(2).find("input").at(2).prop("value")).toEqual(0);
		});
	});

	describe("when the delete button is pressed", () => {
		let r;
		beforeEach(() => {
			sampleOptions = [
				{
					sequence: 1,
					value: "Good",
					marks: 2,
				}, {
					sequence: 2,
					value: "Bad",
					marks: 1,
				}, {
					sequence: 3,
					value: "Worse",
					marks: 0,
				},
			];

			r = shallow(<OptionBuilder
				options={sampleOptions}
				onChange={onChange}
			/>);
			r.find("button").at(1).simulate("click");
		});

		it("deletes the row", () => {
			expect(r.find("tbody > tr")).toHaveLength(2);
		});
	});

	describe("when all options are deleted", () => {
		let r;
		beforeEach(() => {
			sampleOptions = [
				{
					sequence: 1,
					value: "Good",
					marks: 2,
				},
			];

			r = shallow(<OptionBuilder
				options={sampleOptions}
				onChange={onChange}
			/>);
			r.find("button").at(1).simulate("click");
		});

		it("renders a message", () => {
			expect(r.find("tbody > tr > td").text()).toContain("atleast one option is needed");
		});
	});

	describe("when the options are changed", () => {
		let r;
		beforeEach(() => {
			sampleOptions = [
				{
					sequence: 1,
					value: "Good",
					marks: 2,
				},
			];

			r = shallow(<OptionBuilder
				options={sampleOptions}
				onChange={onChange}
			/>);
		});

		it.each([
			["sequence", 34, 0],
			["value", "Bestest", 1],
			["marks", 43, 2],
		])("updates the %s to %s", (key, value, index) => {
			r.find("tbody > tr input").at(index).simulate("change", { target: { name: key, value: value}});
			expect(onChange).toBeCalledWith([Object.assign({}, sampleOptions[0], { [key]: value })]);
		});
	});
});
