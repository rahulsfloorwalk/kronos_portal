import React from "react";
import renderer from "react-test-renderer";

import { AttachmentProofType } from "../../constants.js";
import AttachmentProofIcon from "../AttachmentProofIcon.jsx";

describe("<AttachmentProofIcon/>", () => {
	test.each(AttachmentProofType)("renders correctly for proof type: %s", (proofType) => {
		const tree = renderer.create(<AttachmentProofIcon proofType={proofType}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
