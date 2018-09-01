import React from "react";
import renderer from "react-test-renderer";

import Jumbotron from "../Jumbotron.jsx";

describe("<Jumbotron/>", () => {
	const sampleProps = {
		heading: "Chimichanga!",
		para: "These are not the headings you're looking for.",
	};

	it("renders a Jumbotron", () => {
		const tree = renderer
			.create(<Jumbotron {...sampleProps}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a left aligned Jumbotron", () => {
		const tree = renderer
			.create(<Jumbotron align="left" {...sampleProps}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders a right aligned Jumbotron", () => {
		const tree = renderer
			.create(<Jumbotron align="right" {...sampleProps}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
