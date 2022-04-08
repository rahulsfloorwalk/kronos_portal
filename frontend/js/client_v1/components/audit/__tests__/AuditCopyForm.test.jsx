import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import { __AuditCopyForm } from "../AuditCopyForm.jsx";
import { copyAuditsFromTo } from "../../../service/audit.js";

jest.mock("../../../service/audit.js");

const sampleAuditCycle = {
	id: 1,
	name: "Audit Cycle 1",
	client: {
		id: 2,
		name: "Foobar Client",
	},
	questionnaire_type: {
		id: 1,
		name: "Q Type 1",
	},
};

const sampleAuditCycles = [
	{
		id: 2,
		name: "Audit Cycle 2",
		client: {
			id: 2,
			name: "Foobar Client",
		},
		questionnaire_type: {
			id: 2,
			name: "Q Type 2",
		},
	},
	{
		id: 3,
		name: "Audit Cycle 3",
		client: {
			id: 2,
			name: "Foobar Client",
		},
		questionnaire_type: null,
	},
];

describe("<__AuditCopyForm/>", () => {
	it("renders the list of audit cycles", () => {
		const fetchAuditCycles = jest.fn();
		const r = renderer.create(<__AuditCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls fetchAuditCycles propw when the form is loaded", () => {
		const fetchAuditCycles = jest.fn();
		copyAuditsFromTo.mockResolvedValue([]);

		shallow(<__AuditCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);

		expect(fetchAuditCycles).toBeCalled();
	});

	it("calls copySectionsFromTo when the form is submitted", () => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();
		copyAuditsFromTo.mockResolvedValue([]);

		const r = shallow(<__AuditCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);

		r.find("FormSelect").simulate("change", { target: { name: "selectedAuditCycleId", value: "2"}});
		r.find("form").simulate("submit", { preventDefault });

		expect(copyAuditsFromTo).toBeCalledWith("2", sampleAuditCycle.id);
	});

	it("calls form.preventDefault when the form is submitted", () => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();
		copyAuditsFromTo.mockResolvedValue([]);

		const r = shallow(<__AuditCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);

		r.find("form").simulate("submit", { preventDefault });

		expect(preventDefault).toBeCalled();
	});

	it("calls shows when the form is submitted", (done) => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();
		const responseJSON = {
			non_field_errors: [ "sample error" ],
		};
		copyAuditsFromTo.mockRejectedValue({ responseJSON });

		const r = shallow(<__AuditCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);

		r.find("FormSelect").simulate("change", { target: { name: "selectedAuditCycleId", value: "2"}});
		r.find("form").simulate("submit", { preventDefault });

		expect(copyAuditsFromTo).toBeCalledWith("2", sampleAuditCycle.id);
		setTimeout(() => {
			r.update();
			expect(r.find("FormErrorList").prop("errors")).toEqual(responseJSON.non_field_errors);
			done();
		});
	});
});
