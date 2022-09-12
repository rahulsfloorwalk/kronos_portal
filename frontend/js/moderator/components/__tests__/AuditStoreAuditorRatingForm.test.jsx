import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import AuditStoreAuditorRatingForm from "../../../moderator/components/AuditStoreAuditorRatingForm.jsx";

jest.mock("../../../moderator/service/audit_store");
import { findById, auditor_rate } from "../../../moderator/service/audit_store";

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
				auditor_rating: null
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
		const r = renderer.create(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when AuditStore is not auditor rated", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = renderer.create(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("is rendered correctly when AuditStore is already rated", (done) => {
		sampleAuditStore.user.profileinfo.avg_auditor_rating = 3;
		findById.mockResolvedValue(sampleAuditStore);
		const r = renderer.create(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("renders no auditor_rating on mounting", () => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		expect(r.find("button.active").length).toEqual(0);
	});

	it("renders existing auditor_rating on mounting", (done) => {
		sampleAuditStore.user.profileinfo.avg_auditor_rating = 3;
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.update();
			expect(r.state().rating).toEqual(3);
			done();
		});
	});

	it("selects 1 star rating when the 1st radio is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.find("input[type='radio']").at(0).simulate("change", { target: { checked: true } });
			expect(r.state().rating).toEqual(5);
			done();
		});
	});

	it("selects 2 star rating when the 2nd radio is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.find("input[type='radio']").at(1).simulate("change", { target: { checked: true } });
			expect(r.state().rating).toEqual(4);
			done();
		});
	});

	it("selects 3 star rating when the 3rd radio is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.find("input[type='radio']").at(2).simulate("change", { target: { checked: true } });
			expect(r.state().rating).toEqual(3);
			done();
		});
	});

	it("selects 4 star rating when the 4th radio is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.find("input[type='radio']").at(3).simulate("change", { target: { checked: true } });
			expect(r.state().rating).toEqual(2);
			done();
		});
	});

	it("selects 5 star rating when the 5th radio is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);
		setTimeout(() => {
			r.find("input[type='radio']").at(4).simulate("change", { target: { checked: true } });
			expect(r.state().rating).toEqual(1);
			done();
		});
	});

	it("calls auditor_rate() with the correct rating and closes modal when save is clicked", (done) => {
		findById.mockResolvedValue(sampleAuditStore);
		auditor_rate.mockResolvedValue(sampleAuditStore);
		const r = shallow(<AuditStoreAuditorRatingForm params={sampleParams} router={mockRouter}/>);

		expect(findById).toHaveBeenCalledWith(sampleParams.auditStoreId);
		r.find("input[type='radio']").at(2).simulate("change");
		r.find("form").simulate("submit", formSubmitEvent);
		expect(formSubmitEvent.preventDefault).toHaveBeenCalled();
		expect(auditor_rate).lastCalledWith(sampleParams.auditStoreId, 3);
		setTimeout(() => {
			expect(mockRouter.goBack).toHaveBeenCalled();
			done();
		});
	});
});
