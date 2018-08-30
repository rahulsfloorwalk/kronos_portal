import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import FormSelect from "../FormSelect.jsx";

describe("<FormSelect/>", () => {
	const sampleErrors = [
		"This field cannot be blank",
	];

	const basicProps = {
		value: "",
		name: "foobar",
		label: "Foobar",
		placeholder: "Foobaz",
	};

	const sampleOptions = ["one", "two", "three"];
	const sampleChildren = sampleOptions.map(e => <option key={e} value={e}>{e}</option>);

	it("renders a blank select", () => {
		const tree = renderer
			.create(<FormSelect {...basicProps} value="">{sampleChildren}</FormSelect>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a select with an option selected", () => {
		const tree = renderer
			.create(<FormSelect {...basicProps} value={sampleOptions[1]}>{sampleChildren}</FormSelect>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a select with errors", () => {
		const tree = renderer
			.create(<FormSelect {...basicProps} value={sampleOptions[1]} errors={sampleErrors}>{sampleChildren}</FormSelect>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a disabled select", () => {
		const tree = renderer
			.create(<FormSelect {...basicProps} disabled={true} value={sampleOptions[1]}>{sampleChildren}</FormSelect>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("calls onChange with when the selected value is changed", () => {
		const changeEvent = {
			name: basicProps.name,
			value: sampleOptions[2],
		};
		const onChangeCb = jest.fn();
		const w = shallow(<FormSelect {...basicProps} onChange={onChangeCb}>{sampleChildren}</FormSelect>);
		w.find("select").simulate("change", changeEvent);
		expect(onChangeCb).toBeCalledWith(changeEvent);
	});

	it("converts undefined value to an empty string", () => {
		const r = shallow(<FormSelect {...basicProps} value={undefined}>{sampleChildren}</FormSelect>);
		expect(r.find("select").prop("value")).toEqual("");
	});
});
