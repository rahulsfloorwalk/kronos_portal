import React from "react";
import renderer from "react-test-renderer";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";
import Header from "../Header.jsx";
import { RouterContextProvider } from "../../../test_utils.js";

import { fetchUser } from "../../service/user.js";

jest.mock("../../service/user.js");

describe("<Header>", () => {

	const middlewares = [ReduxThunk];
	const mockStore = configureStore(middlewares);
	let store;
	let router;

	const initialState = {
		client: {
			address: "Example address",
			company_website_url: "http://www.example.com",
			email: "client@example.com",
			id: 6,
			logo_url: "",
			name: "client name",
			phone: "4562356895",
			receive_email_notification: true
		},
		account: {
			balance: 500
		}
	};

	const sampleClientUser = {
		"id": 9,
		"full_name": "vivek user",
		"client": {
			"id": 6,
			"name": "Example",
			"email": "client@example.com",
			"phone": "4562356895",
			"logo_url": "",
			"receive_email_notification": true
		},
		"user": {
			"id": 29,
			"email": "client@example.com"
		},
		"is_client_admin": true
	};

	beforeEach(() => {
		store = mockStore(initialState);
		router = {
			push: jest.fn(),
			goBack: jest.fn(),
		};
	});

	it("renders an header correctly", (done) => {
		let location = {
			pathname: "/foo/bar",
		};

		fetchUser.mockResolvedValue(sampleClientUser);

		const renderedValue = renderer.create(
			<Provider store={store}>
				<RouterContextProvider>
					<Header store={store} location={location} router={router}/>
				</RouterContextProvider>
			</Provider>
		);
		setTimeout(() => {
			expect(renderedValue.toJSON()).toMatchSnapshot();
			done();
		});
	});
});