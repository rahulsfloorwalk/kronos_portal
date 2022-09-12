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
		sampleAuditStore.user.profileinfo.avg_auditor_rating = 4;
		const r = renderer.create(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders no auditor_rating on mounting", () => {
		const r = shallow(<AuditStoreAuditorRatingForm bankInfo={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.find("input[type='radio']").length).toEqual(0);
	});

	it("renders existing auditor_rating on mounting", () => {
		sampleAuditStore.user.profileinfo.avg_auditor_rating = 3;
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		expect(r.state().rating).toEqual(3);
	});

	it("selects 1 star rating when the 1 star is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("input[type='radio']").at(0).simulate("change");
		expect(r.state().rating).toEqual(5);
	});

	it("selects 2 star rating when the 2 star is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("input[type='radio']").at(1).simulate("change");
		expect(r.state().rating).toEqual(4);
	});

	it("selects 3 star rating when the 3 star is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("input[type='radio']").at(2).simulate("change");
		expect(r.state().rating).toEqual(3);
	});

	it("selects 4 star rating when the 4 star is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("input[type='radio']").at(3).simulate("change");
		expect(r.state().rating).toEqual(2);
	});

	it("selects 5 star rating when the 5 star is clicked", () => {
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} dispatch={dispatch} router={mockRouter}/>);
		r.find("input[type='radio']").at(4).simulate("change");
		expect(r.state().rating).toEqual(1);
	});

	it("calls auditor_rate() with the correct rating and closes modal when save is clicked", (done) => {
		auditor_rate.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm auditStore={sampleAuditStore} params={sampleParams} dispatch={dispatch} router={mockRouter}/>);

		r.find("input[type='radio']").at(2).simulate("click");
		r.find("form").simulate("submit", formSubmitEvent);
		expect(formSubmitEvent.preventDefault).toHaveBeenCalled();
		expect(auditor_rate).lastCalledWith(5, 3);
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
