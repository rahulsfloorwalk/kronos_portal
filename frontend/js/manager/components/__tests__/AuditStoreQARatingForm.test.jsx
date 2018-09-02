import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { AuditStoreQARatingForm } from "../../../manager/components/AuditStoreQARatingForm.jsx";

jest.mock("../../../manager/service/audit_store");
import { rate } from "../../../manager/service/audit_store";

describe("<AuditStoreQARatingForm/>", () => {
	const sampleParams = {
		auditStoreId: 5,
	};

	const sampleAuditStore = {
		id: 5,
		user: {
			profileinfo: {
				first_name: "John",
				last_name: "Doe",
			}
		},
		audit_date: "2018-09-02",
		qa_rating: null,
	};

	let dispatch, mockRouter, formSubmitEvent;

	beforeEach(() => {
		dispatch = jest.fn();

		mockRouter = {
			goBack: jest.fn(),
		};

		formSubmitEvent = {
			preventDefault: jest.fn(),
		};
	});

	it("is rendered correctly when the AuditStore is loading", () => {
		const r = renderer.create(<AuditStoreQARatingForm auditStore={undefined} dispatch={dispatch} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is not rated", () => {
		const r = renderer.create(<AuditStoreQARatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is already rated", () => {
		sampleAuditStore.qa_rating = 1;
		const r = renderer.create(<AuditStoreQARatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders no qa_rating on mounting", () => {
		const r = shallow(<AuditStoreQARatingForm bankInfo={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.find("button.active").length).toEqual(0);
	});

	it("renders existing qa_rating on mounting", () => {
		sampleAuditStore.qa_rating = 2;
		const r = shallow(<AuditStoreQARatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Good");
	});

	it("selects 0 rating when the Bad button is clicked", () => {
		const r = shallow(<AuditStoreQARatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("button").at(0).simulate("click");
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Bad");
		expect(r.state().rating).toEqual(0);
	});

	it("selects 1 rating when the Average button is clicked", () => {
		const r = shallow(<AuditStoreQARatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("button").at(1).simulate("click");
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Average");
		expect(r.state().rating).toEqual(1);
	});

	it("selects 2 rating when the Good button is clicked", () => {
		const r = shallow(<AuditStoreQARatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("button").at(2).simulate("click");
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Good");
		expect(r.state().rating).toEqual(2);
	});

	it("calls rate() with the correct rating and closes modal when save is clicked", (done) => {
		rate.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreQARatingForm auditStore={sampleAuditStore} params={sampleParams} dispatch={dispatch} router={mockRouter}/>);

		r.find("button").at(2).simulate("click");
		r.find("form").simulate("submit", formSubmitEvent);
		expect(formSubmitEvent.preventDefault).toHaveBeenCalled();
		expect(rate).lastCalledWith(5, 2);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: "AUDIT_STORE_UPDATED",
				status: "success",
				auditStore: sampleAuditStore
			});
			expect(mockRouter.goBack).toHaveBeenCalled();
			done();
		});
	});
});
