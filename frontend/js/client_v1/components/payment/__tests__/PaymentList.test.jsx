import React from "react";
import renderer from "react-test-renderer";
import PaymentList from "../PaymentList.jsx";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";
import { getClientPayments } from "../../../service/payment.js";

jest.mock("../../../service/payment.js");

describe("<PaymentList>", () => {

	const middlewares = [ReduxThunk];
	const mockStore = configureStore(middlewares);
	let store;

	const initialState = {
		client: {
			address: "Japan1",
			company_website_url: "http://www.samsung.com",
			email: "client@samsung.com",
			id: 6,
			logo_url: "",
			name: "Samsung",
			phone: "4562356895",
			receive_email_notification: true
		},
	};

	const samplePayments = [
		{
			"id": 1,
			"amount": 5000,
			"status": "PAID",
			"paid_on": "2022-04-04T08:51:37.203779Z",
			"added_on": "2022-03-31T10:11:31.383629Z"
		},
		{
			"id": 2,
			"amount": 7000,
			"status": "PAID",
			"paid_on": "2022-04-04T05:49:19.851415Z",
			"added_on": "2022-04-04T05:48:35.932281Z"
		}
	];

	beforeEach(() => {
		store = mockStore(initialState);
	});

	it("renders an empty list correctly", () => {
		getClientPayments.mockResolvedValue([]);
		const renderedValue =  renderer.create(
			<Provider store={store}>
				<PaymentList store={store} />
			</Provider>
		).toJSON();
		expect(renderedValue).toMatchSnapshot();
	});

	it("renders an payment list correctly", (done) => {
		getClientPayments.mockResolvedValue(samplePayments);
		const renderedValue =  renderer.create(
			<Provider store={store}>
				<PaymentList store={store} />
			</Provider>
		);
		setTimeout(() => {
			expect(renderedValue.toJSON()).toMatchSnapshot();
			done();
		});
	});
});