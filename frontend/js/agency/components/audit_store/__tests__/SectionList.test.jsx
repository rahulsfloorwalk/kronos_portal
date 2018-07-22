import React from "react";
import ShallowRenderer from "react-test-renderer/shallow";

import { __SectionList } from "../SectionList.jsx";

describe("<__SectionList/>", () => {
	const renderer = new ShallowRenderer();

	const auditStoreId = 2;

	const sampleSections = [
		{
			id: 1,
			sequence: 1,
			name: "Personal Details",
		},
		{
			id: 2,
			sequence: 2,
			name: "Professional Details",
		},
	];

	it("renders the list of sections correctly", () => {
		const tree = renderer.render(<__SectionList sections={sampleSections} auditStoreId={auditStoreId}/>);
		expect(tree).toMatchSnapshot();
	});

	it("renders correctly when there are no sections", () => {
		const tree = renderer.render(<__SectionList sections={[]} auditStoreId={auditStoreId}/>);
		expect(tree).toMatchSnapshot();
	});
});
