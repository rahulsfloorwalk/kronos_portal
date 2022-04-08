import React from "react";
import renderer from "react-test-renderer";

import ClientUserList from "../ClientUserList.jsx";

import { fetchClientUsers } from "../../../service/client_user.js";

jest.mock("../../../service/client_user.js");

const sampleParams = {
	clientId: "5",
};

const sampleClientUsers = [
	{
		"id": 1,
		"full_name": "Client User1",
		"client": {
			"id": 1,
			"name": "Client user 2",
			"email": "client_user1@example.in",
			"phone": "1234567890",
			"logo_url": "https://www.logo.com/logo.png",
			"address": "Maharashtra",
			"company_website_url": "http://www.google.com",
			"receive_email_notification": true
		},
		"user": {
			"id": 3,
			"email": "client_user1@example.in",
			"is_active": true,
			"mobile_numbers": []
		},
		"is_client_admin": true,
		"receive_email_notification": false
	},
	{
		"id": 6,
		"full_name": "client user2",
		"client": {
			"id": 2,
			"name": "Client user 2",
			"email": "client_user2@example.in",
			"phone": "1234567890",
			"logo_url": "https://www.logo.com/logo.png",
			"address": "Maharashtra",
			"company_website_url": "http://www.google.com",
			"receive_email_notification": true
		},
		"user": {
			"id": 26,
			"email": "client_user2@example.in",
			"is_active": true,
			"mobile_numbers": []
		},
		"is_client_admin": false,
		"receive_email_notification": true
	}
];

describe("<ClientUserList/>", () => {
	it("renders a list of client users", (done) => {
		fetchClientUsers.mockResolvedValue(sampleClientUsers);
		const r = renderer.create(<ClientUserList params={sampleParams} />);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});