import React from "react";
import renderer from "react-test-renderer";

import { AuditStoreStatus } from "../../constants.js";
import AuditStoreStatusLabel from "../AuditStoreStatusLabel.jsx";

describe("<AuditStoreStatusLabel/>", () => {
	test.each(AuditStoreStatus)("renders correctly for status: %s", (testStatus) => {
		const tree = renderer.create(<AuditStoreStatusLabel status={testStatus}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
