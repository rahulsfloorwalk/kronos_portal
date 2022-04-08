import React from "react";
import renderer from "react-test-renderer";
import CheckoutForm from "../CheckoutForm.jsx";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";

describe("<CheckoutForm>", () => {

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
		countries: {}
	};

	beforeEach(() => {
		store = mockStore(initialState);
	});

	it("renders an empty form correctly", () => {
		const toggleCheckout = jest.fn();
		const renderedValue =  renderer.create(
			<Provider store={store}>
				<CheckoutForm store={store} payable_amount={15} toggleCheckout={toggleCheckout} />
			</Provider>
		).toJSON();
		expect(renderedValue).toMatchSnapshot();
	});
});