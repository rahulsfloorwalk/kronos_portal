import React from "react";
import ShallowRenderer from "react-test-renderer/shallow";

import { StorePerformanceCount } from "../StorePerformanceCount.jsx";

const sampleQuestionnaireType = {
	"id": 213,
	"name": "Walk In",
	"is_default": true,
	"client_id": 9
};

describe(StorePerformanceCount, () => {
	const renderer = new ShallowRenderer();
	it("renders the tab strip and data with the selected questionnaire type", () => {
		const tree = renderer.render(<StorePerformanceCount selectedQuestionnaireType={sampleQuestionnaireType}/>);
		expect(tree).toMatchSnapshot();
	});

	it("renders the tab strip and a loading sign when no questionnaire type is selected", () => {
		const tree = renderer.render(<StorePerformanceCount selectedQuestionnaireType={undefined}/>);
		expect(tree).toMatchSnapshot();
	});
});
