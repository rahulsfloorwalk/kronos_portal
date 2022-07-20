import React from "react";
import ShallowRenderer from "react-test-renderer/shallow";

import { Dashboard } from "../Dashboard.jsx";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

const sampleQuestionnaireType = {
	"id": 213,
	"name": "Walk In",
	"is_default": true,
	"client_id": 9
};

const user = {
	"id": 1,
	"full_name": "Floorwalk User",
	"client": {
		"id": 1,
		"name": "FloorWalk",
		"email": "user@example.in",
		"phone": "2548965235",
		"logo_url": "",
		"receive_email_notification": true
	},
	"user": {
		"id": 3,
		"email": "user@example.in"
	},
	"is_client_admin": true
};

describe(Dashboard, () => {
	const renderer = new ShallowRenderer();
	const fetchUser = jest.fn();
	it("renders the tab strip and charts with the selected questionnaire type", () => {
		const tree = renderer.render(<Dashboard selectedQuestionnaireType={sampleQuestionnaireType} isClientAdmin={true} fetchUser={fetchUser} user={user} />);
		expect(tree).toMatchSnapshot();
	});

	it("renders the tab strip and a loading sign when no questionnaire type is selected", () => {
		const tree = renderer.render(<Dashboard selectedQuestionnaireType={undefined} isClientAdmin={true} fetchUser={fetchUser} user={user} />);
		expect(tree).toMatchSnapshot();
	});
});
