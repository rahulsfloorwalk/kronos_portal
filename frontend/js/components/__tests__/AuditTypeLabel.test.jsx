import React from "react";
import renderer from "react-test-renderer";

import { AuditType } from "../../constants.js";
import AuditTypeLabel from "../AuditTypeLabel.jsx";

describe("<AuditTypeLabel/>", () => {
	test.each(AuditType)("renders correctly for audit type: %s", (testType) => {
		const tree = renderer.create(<AuditTypeLabel auditType={testType}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
