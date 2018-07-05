import React from "react";
import renderer from "react-test-renderer";

import PostApprovalDescriptionRenderer from "../PostApprovalDescriptionRenderer.jsx";

describe("<PostApprovalDescriptionRenderer/>", () => {
	const sampleAudit = {
		post_approval_description: "Hello _World_",
		audit_cycle: {
			post_approval_description: "This is some *markdown* text.",
		}
	};

	it("renders the loading icons while loading the markdown libs", () => {
		const tree = renderer.create(<PostApprovalDescriptionRenderer audit={sampleAudit}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders the post approval description", (done) => {
		const r = renderer.create(<PostApprovalDescriptionRenderer audit={sampleAudit}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});
