import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { AuditStoreAuditorRatingForm } from "../AuditStoreAuditorRatingForm.jsx";

jest.mock("../../../service/audit_store");
import { auditor_rate } from "../../../service/audit_store";

describe("<AuditStorAuditorRatingForm/>", () => {
	const sampleParams = {
		auditStoreId: 5,
	};

	const sampleAuditStore = {
		id: 5,
		user: {
			profileinfo: {
				first_name: "John",
				last_name: "Doe",
				auditor_rating: null
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
		const r = renderer.create(<AuditStoreAuditorRatingForm auditStore={undefined} dispatch={dispatch} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is not auditor rated", () => {
		const r = renderer.create(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is already auditor rated", () => {
		sampleAuditStore.user.profileinfo.auditor_rating = "E";
		const r = renderer.create(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders no auditor_rating on mounting", () => {
		const r = shallow(<AuditStoreAuditorRatingForm bankInfo={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.find("button.active").length).toEqual(0);
	});

	it("renders existing auditor_rating on mounting", () => {
		sampleAuditStore.user.profileinfo.auditor_rating = "G";
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Good");
	});

	it("selects W rating when the Worse button is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("button").at(0).simulate("click");
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Worse");
		expect(r.state().rating).toEqual("W");
	});

	it("selects A rating when the Average button is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("button").at(1).simulate("click");
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Average");
		expect(r.state().rating).toEqual("A");
	});

	it("selects G rating when the Good button is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("button").at(2).simulate("click");
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Good");
		expect(r.state().rating).toEqual("G");
	});

	it("selects E rating when the Excellent button is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("button").at(3).simulate("click");
		expect(r.find("button.active").length).toEqual(1);
		expect(r.find("button.active").text()).toEqual("Excellent");
		expect(r.state().rating).toEqual("E");
	});

	it("calls auditor_rate() with the correct rating and closes modal when save is clicked", (done) => {
		auditor_rate.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} params={sampleParams} dispatch={dispatch} router={mockRouter}/>);

		r.find("button").at(2).simulate("click");
		r.find("form").simulate("submit", formSubmitEvent);
		expect(formSubmitEvent.preventDefault).toHaveBeenCalled();
		expect(auditor_rate).lastCalledWith(5, "G");
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
