import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import ExpandableDetails from "../ExpandableDetails.jsx";

describe("<ExpandableDetails/>", () => {
	const message = "Hello World!";
	const sampleContent = <p>{message}</p>;

	it("renders a non expanded inner element", () => {
		const tree = renderer.create(<ExpandableDetails details={sampleContent}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("is collased by default", () => {
		const r = shallow(<ExpandableDetails details={sampleContent}/>);
		expect(r.find("p")).toHaveLength(0);
	});

	it("expands the inner element on click", () => {
		const r = shallow(<ExpandableDetails details={sampleContent}/>);
		r.find("a").simulate("click");
		expect(r.find("p")).toHaveLength(1);
		expect(r.find("p").text()).toEqual(message);
	});

	it("collapses the inner element on the second click", () => {
		const r = shallow(<ExpandableDetails details={sampleContent}/>);
		r.find("a").simulate("click");
		r.find("a").simulate("click");
		expect(r.find("p")).toHaveLength(0);
	});
});
