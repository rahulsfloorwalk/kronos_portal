import React from "react";
import renderer from "react-test-renderer";

import FormGroup from "../FormGroup.jsx";

describe("<FormGroup/>", () => {
	it("renders a group of form elements", () => {
		const tree = renderer
			.create(<FormGroup>
				<label>Label</label>
				<input/>
			</FormGroup>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
