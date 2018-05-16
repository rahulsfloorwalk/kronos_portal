import React from "react";
import { shallow } from "enzyme";
import Checkbox from "../../components/Checkbox.jsx";
import renderer from "react-test-renderer";

describe("<Checkbox/>", () => {
	it("is checked", () => {
		const tree = renderer
			.create(<Checkbox checked={true}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it("is unchecked", () => {
		const tree = renderer
			.create(<Checkbox checked={false}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it("is disabled", () => {
		const tree = renderer
			.create(<Checkbox checked={true} disabled={true}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	let onChangeCb;
	beforeEach( () => {
		onChangeCb = jest.fn();
	});
	it("calls onChange with true when checked", () => {
		const w = shallow(<Checkbox checked={false} onChange={onChangeCb}/>);
		w.find("button").simulate("click");
		expect(onChangeCb).lastCalledWith(true);
	});

	it("calls onChange with false when unchecked", () => {
		const w = shallow(<Checkbox checked={true} onChange={onChangeCb}/>);
		w.find("button").simulate("click");
		expect(onChangeCb).lastCalledWith(false);
	});

	it("does not call onChange when disabled", () => {
		const w = shallow(<Checkbox checked={true} onChange={onChangeCb} disabled={true}/>);
		w.simulate("click");
		expect(onChangeCb).not.toBeCalled();
	});
});
