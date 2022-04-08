import React from "react";
import renderer from "react-test-renderer";

import ClientUserForm from "../ClientUserForm.jsx";

const sampleParams = {
	clientId: "5",
	clientUserId: ""
};

describe("<ClientUserForm>", () => {
	it("renders an empty form correctly", () => {
		const tree = renderer.create(<ClientUserForm params={sampleParams}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});