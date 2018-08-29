import React from "react";
import renderer from "react-test-renderer";

import { AuditStoreRatings } from "../../constants.js";
import AuditStoreRating from "../AuditStoreRating.jsx";

describe("<AuditStoreRating/>", () => {
	test.each(AuditStoreRatings)("renders correctly for rating: %s", (testRating) => {
		const tree = renderer.create(<AuditStoreRating rating={testRating}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
