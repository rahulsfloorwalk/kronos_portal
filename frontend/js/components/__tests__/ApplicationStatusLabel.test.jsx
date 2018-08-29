import React from "react";
import renderer from "react-test-renderer";

import { ApplicationStatus } from "../../constants.js";
import ApplicationStatusLabel from "../ApplicationStatusLabel.jsx";

describe("<ApplicationStatusLabel/>", () => {
	test.each(ApplicationStatus)("renders correctly for status: %s", (testStatus) => {
		const tree = renderer.create(<ApplicationStatusLabel status={testStatus}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
