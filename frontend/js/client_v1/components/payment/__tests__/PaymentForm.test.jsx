import { shallow } from "enzyme";
import React from "react";
import renderer from "react-test-renderer";

import { MinimumPayableAmount } from "../../../../constants.js";
import PaymentForm from "../PaymentForm.jsx";

describe("<PaymentForm>", () => {

	it("renders an empty form correctly", () => {
		const tree = renderer.create(<PaymentForm/>).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders an empty form correctly with initial value", () => {
		const r = shallow(<PaymentForm/>);
		expect(r.state("payable_amount")).toEqual(MinimumPayableAmount);
		expect(r.find("input[name='payable_amount']").props().value).toEqual(MinimumPayableAmount);
	});

	it("test when open checkout form value is false", () => {
		const r = shallow(<PaymentForm/>);
		r.setState({ open_checkout_form: false });
		r.update();
		expect(r.find("input[name='payable_amount']").length).toEqual(1);
	});

	it("test when open checkout form value is true", () => {
		const r = shallow(<PaymentForm/>);
		r.setState({ open_checkout_form: true });
		r.update();
		expect(r.find("input[name='payable_amount']").length).toEqual(0);
	});
});