import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import InPlaceEditable from "../InPlaceEditable.jsx";

describe("<InPlaceEditable/>", () => {
	const basicProps = {
		inputText: "Hello World!",
		emptyString: "enter your message",
	};

	it("renders a value in view mode", () => {
		const tree = renderer.create(<InPlaceEditable {...basicProps} editing={false}>{basicProps["inputText"]}</InPlaceEditable>);
		expect(tree.toJSON()).toMatchSnapshot();
	});

	it("renders a value in view mode in hover state", () => {
		const tree = renderer.create(<InPlaceEditable {...basicProps} editing={false}>{basicProps["inputText"]}</InPlaceEditable>);
		const r = tree.getInstance();
		r.hover();
		expect(tree).toMatchSnapshot();
	});

	it("renders a value in editable mode", () => {
		const tree = renderer.create(<InPlaceEditable {...basicProps} editing={true}/>);
		expect(tree.toJSON()).toMatchSnapshot();
	});

	it("becomes editable when the view is clicked", () => {
		const r = shallow(<InPlaceEditable {...basicProps} editing={false}/>);
		r.at(0).simulate("click");
		expect(r.find("input")).toHaveLength(1);
	});

	it("calls onSave when the input is blurred", () => {
		const onSaveCb = jest.fn();
		const preventDefault = jest.fn();
		const changedText = "World!";

		const r = shallow(<InPlaceEditable {...basicProps} editing={true} onSave={onSaveCb}/>);
		r.find("input").simulate("change", { target: { value: changedText }});
		r.find("input").simulate("blur", { preventDefault });

		expect(onSaveCb).toBeCalledWith(changedText);
	});
});
