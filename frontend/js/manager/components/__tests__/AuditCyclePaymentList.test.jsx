import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import { pay, fail } from "../../service/payment.js";
import { findPaymentsByAuditCycleId } from "../../service/payment.js";
import AuditCyclePaymentList, { PaymentRow } from "../AuditCyclePaymentList";
import { PaymentStatus } from "../../../constants.js";

jest.mock("../../service/payment.js");

const samplePayments = [
	{
		"id": 363,
		"comment": "THIS IS A SAMPLE PAID MESSAGE",
		"amount": 400,
		"status": "PAID",
		"user": {
			"id": 1084,
			"email": "foobar@gmail.com",
			"mobile_numbers": [],
			"profileinfo": {
				"id": 941,
				"first_name": "Foo",
				"last_name": "Bar",
				"mobile_number": "3434343434",
				"city": 631,
				"user_id": 1084
			},
			"agencyuser": null
		},
		"audit_store_id": 639,
		"added_on": "2017-10-14T07:16:44.888540Z",
		"paid_on": "2017-10-14T08:36:39.343085Z",
	},
	{
		"id": 362,
		"comment": "THIS IS A SAMPLE PENDING MESSAGE",
		"amount": 800,
		"status": "PENDING",
		"user": {
			"id": 1038,
			"email": "barbarfoo@gmail.com",
			"mobile_numbers": [],
			"profileinfo": null,
			"agencyuser": {
				"id": 2,
				"full_name": "Amit Gaiki",
				"agency": {
					"id": 3,
					"name": "Gaiki and Gaiki"
				},
				"user_id": 6805
			}
		},
		"audit_store_id": 638,
		"added_on": "2017-10-14T07:16:17.223871Z",
		"paid_on": null,
	}
];

describe("<AuditCyclePaymentList/>", () => {
	const sampleParams = {
		auditCycleId: "5",
	};

	it("it renders the list of payments correctly", (done) => {
		findPaymentsByAuditCycleId.mockReturnValue($.Deferred().resolve(samplePayments));
		const r = renderer.create(<AuditCyclePaymentList params={sampleParams}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("it renders the correct message when there are no payments", (done) => {
		findPaymentsByAuditCycleId.mockReturnValue($.Deferred().resolve([]));
		const r = renderer.create(<AuditCyclePaymentList params={sampleParams}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("it renders the correct number of rows when a payment is paid", (done) => {
		findPaymentsByAuditCycleId.mockReturnValue($.Deferred().resolve(samplePayments));
		const payment = samplePayments[0];
		const paidPaymentResponse = Object.assign({}, payment, { status: "PAID" });

		const r = shallow(<AuditCyclePaymentList params={sampleParams}/>);
		setTimeout(() => {
			r.update();
			expect(r.find(PaymentRow)).toHaveLength(2);
			r.find(PaymentRow).at(1).simulate("change", paidPaymentResponse);
			r.update();
			expect(r.find(PaymentRow)).toHaveLength(2);
			done();
		});
	});

	it("it renders the correct number of rows when a payment is failed", (done) => {
		findPaymentsByAuditCycleId.mockReturnValue($.Deferred().resolve(samplePayments));
		const payment = samplePayments[0];
		const failedPaymentResponse = [
			Object.assign({}, payment, { status: "FAILED" }),
			Object.assign({}, payment, { id: payment.id + 3, status: "PENDING" }),
		];

		const r = shallow(<AuditCyclePaymentList params={sampleParams}/>);
		setTimeout(() => {
			r.update();
			expect(r.find(PaymentRow)).toHaveLength(2);
			r.find(PaymentRow).at(0).simulate("fail", failedPaymentResponse);
			r.update();
			expect(r.find(PaymentRow)).toHaveLength(3);
			done();
		});
	});
});

describe("<PaymentRow/>", () => {

	test.each(PaymentStatus)("renders the row correctly for status %s", (status) => {
		const payment = Object.assign({}, samplePayments[0], { status });
		const r = renderer.create(<PaymentRow payment={payment}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls fail when fail button is clicked", (done) => {
		const payment = samplePayments[0];
		const failedPaymentResponse = [
			Object.assign({}, payment, { status: "FAILED" }),
			Object.assign({}, payment, { status: "PENDING" }),
		];
		fail.mockResolvedValue(failedPaymentResponse);
		const onFail = jest.fn();

		const r = shallow(<PaymentRow payment={payment} onFail={onFail}/>);
		r.find("button").simulate("click");
		expect(fail).toBeCalledWith(payment.id);
		setTimeout(() => {
			expect(onFail).toBeCalledWith(failedPaymentResponse);
			done();
		});
	});

	it("calls pay when pay button is clicked", (done) => {
		const payment = samplePayments[1];
		const paidPaymentResponse = Object.assign({}, payment, { status: "PAID" });
		pay.mockResolvedValue(paidPaymentResponse);
		const onChange = jest.fn();

		const r = shallow(<PaymentRow payment={payment} onChange={onChange}/>);
		r.find("button").simulate("click");
		expect(pay).toBeCalledWith(payment.id);
		setTimeout(() => {
			expect(onChange).toBeCalledWith(paidPaymentResponse);
			done();
		});
	});
});

