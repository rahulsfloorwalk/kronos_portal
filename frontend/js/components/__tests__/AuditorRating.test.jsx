import React from "react";
import renderer from "react-test-renderer";

import { AuditorRatings } from "../../constants.js";
import AuditorRating from "../AuditorRating.jsx";

describe("<AuditorRating/>", () => {
	test.each(AuditorRatings)("renders correctly for rating: %s", (testRating) => {
		const tree = renderer.create(<AuditorRating rating={testRating}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
