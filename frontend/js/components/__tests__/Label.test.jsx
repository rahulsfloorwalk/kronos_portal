import React from "react";
import renderer from "react-test-renderer";

import Label, { labelStyles } from "../Label.jsx";

describe("<Label/>", () => {

	it("renders a Label", () => {
		const tree = renderer
			.create(<Label type="default"/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it.each(labelStyles)("renders Label with the %s style", (type) => {
		const tree = renderer
			.create(<Label type={type}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
