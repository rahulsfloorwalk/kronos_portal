import React from "react";
import renderer from "react-test-renderer";

import Loading from "../Loading.jsx";

describe("<Loading/>", () => {
	it("renders a Loading widget", () => {
		const tree = renderer
			.create(<Loading/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
