import React from "react";
import renderer from "react-test-renderer";

import ApplicationRepeat from "../ApplicationRepeat.jsx";

describe("<ApplicationRepeat/>", () => {
	test.each([true, false, undefined])("renders correctly when report_exists is: %s", (reportExists) => {
		const tree = renderer.create(<ApplicationRepeat report_exists={reportExists}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
