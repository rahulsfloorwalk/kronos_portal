import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import { __SectionCopyForm } from "../SectionCopyForm.jsx";
import { copySectionsFromTo } from "../../service/section.js";

jest.mock("../../service/section.js");

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

describe("<__SectionCopyForm/>", () => {
	it("renders the list of audit cycles", () => {
		const fetchAuditCycles = jest.fn();
		const r = renderer.create(<__SectionCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls fetchAuditCycles propw when the form is loaded", () => {
		const fetchAuditCycles = jest.fn();
		copySectionsFromTo.mockResolvedValue([]);

		shallow(<__SectionCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);

		expect(fetchAuditCycles).toBeCalled();
	});

	it("calls copySectionsFromTo when the form is submitted", () => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();
		copySectionsFromTo.mockResolvedValue([]);

		const r = shallow(<__SectionCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);

		r.find("FormSelect").simulate("change", { target: { name: "selectedAuditCycleId", value: "2"}});
		r.find("form").simulate("submit", { preventDefault });

		expect(copySectionsFromTo).toBeCalledWith("2", sampleAuditCycle.id);
	});

	it("calls form.preventDefault when the form is submitted", () => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();
		copySectionsFromTo.mockResolvedValue([]);

		const r = shallow(<__SectionCopyForm auditCycle={sampleAuditCycle} otherAuditCycles={sampleAuditCycles} fetchAuditCycles={fetchAuditCycles}/>);

		r.find("form").simulate("submit", { preventDefault });

		expect(preventDefault).toBeCalled();
	});
});
