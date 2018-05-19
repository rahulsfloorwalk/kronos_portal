import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import AuditStoreQARatingForm from "../../../moderator/components/AuditStoreQARatingForm.jsx";

jest.mock("../../../moderator/service/audit_store");
import { findById, rate } from "../../../moderator/service/audit_store";

describe("<AuditStoreQARatingForm/>", () => {
	const sampleParams = {
		auditStoreId: "5",
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

	let mockRouter, formSubmitEvent;

	beforeEach(() => {
		mockRouter = {
			goBack: jest.fn(),
		};

		formSubmitEvent = {
			preventDefault: jest.fn(),
		};
	});

	it("is rendered correctly when the AuditStore is loading", () => {
		findById.mockReturnValue(new Promise(() => {}));
		const r = renderer.create(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is not rated", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = renderer.create(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("is rendered correctly when AuditStore is already rated", (done) => {
		sampleAuditStore.qa_rating = 1;
		findById.mockResolvedValue(sampleAuditStore);
		const r = renderer.create(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("renders no qa_rating on mounting", () => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);
		expect(r.find("button.active").length).toEqual(0);
	});

	it("renders existing qa_rating on mounting", (done) => {
		sampleAuditStore.qa_rating = 2;
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.update();
			expect(r.find("button.active").length).toEqual(1);
			expect(r.find("button.active").text()).toEqual("Good");
			done();
		});
	});

	it("selects 0 rating when the Bad button is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.find("button").at(0).simulate("click");
			expect(r.find("button.active").length).toEqual(1);
			expect(r.find("button.active").text()).toEqual("Bad");
			expect(r.state().rating).toEqual(0);
			done();
		});
	});

	it("selects 1 rating when the Average button is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.find("button").at(1).simulate("click");
			expect(r.find("button.active").length).toEqual(1);
			expect(r.find("button.active").text()).toEqual("Average");
			expect(r.state().rating).toEqual(1);
			done();
		});
	});

	it("selects 2 rating when the Good button is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.find("button").at(2).simulate("click");
			expect(r.find("button.active").length).toEqual(1);
			expect(r.find("button.active").text()).toEqual("Good");
			expect(r.state().rating).toEqual(2);
			done();
		});
	});

	it("calls rate() with the correct rating and closes modal when save is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		rate.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreQARatingForm params={sampleParams} router={mockRouter}/>);

		expect(findById).toHaveBeenCalledWith(sampleParams.auditStoreId);
		r.find("button").at(2).simulate("click");
		r.find("form").simulate("submit", formSubmitEvent);
		expect(formSubmitEvent.preventDefault).toHaveBeenCalled();
		expect(rate).lastCalledWith(sampleParams.auditStoreId, 2);
		setTimeout(() => {
			expect(mockRouter.goBack).toHaveBeenCalled();
			done();
		});
	});
});
