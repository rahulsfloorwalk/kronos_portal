import React from "react";
import renderer from "react-test-renderer";

import Footer from "../Footer.jsx";

describe("<Footer/>", () => {
	const sampleConfig = {
		RHEA_BASE_URL: "https://floorwalk.in",
		RHEA_DOMAIN: "floorwalk.in",
		SUPPORT_EMAIL: "support@floorwalk.in",
		SUPPORT_PHONE: "+91-1234567890",
		TW_PAGE_URL: "https://twitter.com/kronos",
		TW_USERNAME: "KronosIndia",
		PHOEBE_VERSION: "1.0.0",
		BRAND_NAME: "Kronos",
	};

	it("renders the footer", () => {
		const tree = renderer.create(<Footer config={sampleConfig}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
