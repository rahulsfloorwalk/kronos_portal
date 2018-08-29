import React from "react";
import { shallow, mount } from "enzyme";
import FormInput from "../FormInput.jsx";
import renderer from "react-test-renderer";

describe("<FormInput/>", () => {
	const basicProps = {
		value: "Foobar",
		name: "foobar",
		label: "Foobar",
	};

	it("renders a default input with basic props", () => {
		const tree = renderer
			.create(<FormInput {...basicProps} placeholder="Foobaz"/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders an input with maxLength", () => {
		const tree = renderer
			.create(<FormInput {...basicProps} maxLength={50} placeholder="Foobaz"/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a disabled input", () => {
		const tree = renderer
			.create(<FormInput {...basicProps} disabled={true}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a checked checkbox", () => {
		const tree = renderer
			.create(<FormInput type="checkbox" checked={true} {...basicProps}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders an unchecked checkbox", () => {
		const tree = renderer
			.create(<FormInput type="checkbox" checked={false} {...basicProps}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("calls onChange with the new value", () => {
		const changeEvent = {
			name: basicProps.name,
			value: "changed" + basicProps.value,
		};
		const onChangeCb = jest.fn();
		const w = shallow(<FormInput {...basicProps} onChange={onChangeCb}/>);
		w.find("input").simulate("change", changeEvent);
		expect(onChangeCb).lastCalledWith(changeEvent);
	});

	it("calls onChange with true when checked", () => {
		const changeEvent = {
			name: basicProps.name,
			checked: true,
		};
		const onChangeCb = jest.fn();
		const w = shallow(<FormInput checked={false} onChange={onChangeCb}/>);
		w.find("input").simulate("change", changeEvent);
		expect(onChangeCb).lastCalledWith(changeEvent);
	});

	it("calls onChange with false when unchecked", () => {
		const changeEvent = {
			name: basicProps.name,
			checked: false,
		};
		const onChangeCb = jest.fn();
		const w = shallow(<FormInput checked={true} onChange={onChangeCb}/>);
		w.find("input").simulate("change", changeEvent);
		expect(onChangeCb).lastCalledWith(changeEvent);
	});

	it("sets disabled='true' on input", () => {
		const w = shallow(<FormInput {...basicProps} disabled={true}/>);
		expect(w.find("input").prop("disabled")).toEqual(true);
	});

	it("focuses the input", () => {
		const w = mount(<FormInput {...basicProps} onChange={() => {}}/>);
		jest.spyOn(w.instance()._input, "focus");
		w.instance().focus();
		expect(w.instance()._input.focus).toHaveBeenCalled();
	});

	it("converts undefined value to an empty string", () => {
		const w = mount(<FormInput value={undefined} onChange={() => {}}/>);
		expect(w.find("input").prop("value")).toEqual("");
	});
});
