import React from "react";
import renderer from "react-test-renderer";

import FormErrorList from "../FormErrorList.jsx";

describe("<FormErrorList/>", () => {
	const sampleErrors = [
		"This field cannot be blank!",
		"This date is out of range!",
	];

	it("renders an array of errors correctly", () => {
		const tree = renderer
			.create(<FormErrorList errors={sampleErrors}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders nothing when there are no errors", () => {
		const tree = renderer
			.create(<FormErrorList errors={[]}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
