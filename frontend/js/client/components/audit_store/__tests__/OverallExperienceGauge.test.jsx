import React from "react";
import renderer from "react-test-renderer";

import OverallExperienceGauge from "../OverallExperienceGauge.jsx";

describe(OverallExperienceGauge, () => {

	test.each([1,2,3,4,5])("renders the experience gauge correctly for colorCode: %s", (colorCode) => {
		const r = renderer.create(<OverallExperienceGauge colorCode={colorCode} value={64}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});

