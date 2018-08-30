import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import FormTextarea from "../FormTextarea.jsx";

describe("<FormTextarea/>", () => {
	const sampleErrors = [
		"This field cannot be blank",
	];

	const basicProps = {
		value: "",
		name: "foobar",
		label: "Foobar",
		placeholder: "Foobaz",
		maxLength: 80,
	};

	it("renders a blank textarea", () => {
		const tree = renderer
			.create(<FormTextarea {...basicProps} value=""/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a textarea with a prefilled value", () => {
		const tree = renderer
			.create(<FormTextarea {...basicProps} value="Hello World!"/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a textarea with errors", () => {
		const tree = renderer
			.create(<FormTextarea {...basicProps} value="" errors={sampleErrors}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a disabled textarea", () => {
		const tree = renderer
			.create(<FormTextarea {...basicProps} disabled={true} value={"Hello World!"}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("calls onChange with when the textarea value is changed", () => {
		const changeEvent = {
			name: basicProps.name,
			value: "Hello World!",
		};
		const onChangeCb = jest.fn();
		const w = shallow(<FormTextarea {...basicProps} onChange={onChangeCb}/>);
		w.find("textarea").simulate("change", changeEvent);
		expect(onChangeCb).toBeCalledWith(changeEvent);
	});

	it("converts undefined value to an empty string", () => {
		const r = shallow(<FormTextarea {...basicProps} value={undefined}/>);
		expect(r.find("textarea").prop("value")).toEqual("");
	});
});
