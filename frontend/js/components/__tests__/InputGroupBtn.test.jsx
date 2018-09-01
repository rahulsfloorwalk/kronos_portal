import React from "react";
import renderer from "react-test-renderer";

import { InputGroupBtn } from "../InputGroup.jsx";

describe("<InputGroupBtn/>", () => {
	it("renders a group of buttons", () => {
		const tree = renderer
			.create(<InputGroupBtn>
				<button className="btn btn-success">Add</button>
				<button className="btn btn-warning">Edit</button>
				<button className="btn btn-danger">Delete</button>
			</InputGroupBtn>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
