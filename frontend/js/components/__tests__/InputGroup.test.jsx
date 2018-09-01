import React from "react";
import renderer from "react-test-renderer";

import InputGroup from "../InputGroup.jsx";

describe("<InputGroup/>", () => {
	it("renders a group of input elements", () => {
		const tree = renderer
			.create(<InputGroup>
				<input/>
				<button className="btn btn-default">Search</button>
			</InputGroup>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
