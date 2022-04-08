import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import { __SectionCopyForm } from "../SectionCopyForm.jsx";
import { copySectionsFromTo } from "../../../service/section.js";

jest.mock("../../../service/section.js");

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
	let mockRouter;

	beforeEach(() => {
		mockRouter = {
			goBack: jest.fn(),
			push: jest.fn(),
		};
	});

	it("renders the list of audit cycles", () => {
		const fetchAuditCycles = jest.fn();
		const r = renderer.create(<__SectionCopyForm
			auditCycle={sampleAuditCycle}
			otherAuditCycles={sampleAuditCycles}
			fetchAuditCycles={fetchAuditCycles}
			router={mockRouter}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls fetchAuditCycles propw when the form is loaded", () => {
		const fetchAuditCycles = jest.fn();
		copySectionsFromTo.mockResolvedValue([]);

		shallow(<__SectionCopyForm
			auditCycle={sampleAuditCycle}
			otherAuditCycles={sampleAuditCycles}
			fetchAuditCycles={fetchAuditCycles}
			router={mockRouter}
		/>);

		expect(fetchAuditCycles).toBeCalled();
	});

	it("calls copySectionsFromTo when the form is submitted", () => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();
		copySectionsFromTo.mockResolvedValue([]);

		const r = shallow(<__SectionCopyForm
			auditCycle={sampleAuditCycle}
			otherAuditCycles={sampleAuditCycles}
			fetchAuditCycles={fetchAuditCycles}
			router={mockRouter}
		/>);

		r.find("FormSelect").simulate("change", { target: { name: "selectedAuditCycleId", value: "2"}});
		r.find("form").simulate("submit", { preventDefault });

		expect(copySectionsFromTo).toBeCalledWith("2", sampleAuditCycle.id);
	});

	it("calls form.preventDefault when the form is submitted", () => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();
		copySectionsFromTo.mockResolvedValue([]);

		const r = shallow(<__SectionCopyForm
			auditCycle={sampleAuditCycle}
			otherAuditCycles={sampleAuditCycles}
			fetchAuditCycles={fetchAuditCycles}
			router={mockRouter}
		/>);

		r.find("form").simulate("submit", { preventDefault });

		expect(preventDefault).toBeCalled();
	});

	it("displays the errors when there is an error", (done) => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();

		copySectionsFromTo.mockRejectedValue({
			responseJSON: {
				non_field_errors: ["audit cycle already has sections"],
			},
		});

		const r = shallow(<__SectionCopyForm
			auditCycle={sampleAuditCycle}
			otherAuditCycles={sampleAuditCycles}
			fetchAuditCycles={fetchAuditCycles}
			router={mockRouter}
		/>);

		r.find("form").simulate("submit", { preventDefault });
		setTimeout(() => {
			r.update();
			expect(r.find("FormErrorList").prop("errors")).toEqual(["audit cycle already has sections"]);
			done();
		});
	});

	it("navigates to the questionnaire when the form is submitted successfully", (done) => {
		const fetchAuditCycles = jest.fn();
		const preventDefault = jest.fn();
		copySectionsFromTo.mockResolvedValue([]);

		const r = shallow(<__SectionCopyForm
			auditCycle={sampleAuditCycle}
			otherAuditCycles={sampleAuditCycles}
			fetchAuditCycles={fetchAuditCycles}
			router={mockRouter}
		/>);

		r.find("form").simulate("submit", { preventDefault });
		setTimeout(() => {
			expect(mockRouter.push).toBeCalledWith("/audit_cycle/1/questionnaire");
			done();
		});
	});

	it("navigates back if the modal is closed", () => {
		const fetchAuditCycles = jest.fn();

		const r = shallow(<__SectionCopyForm
			auditCycle={sampleAuditCycle}
			otherAuditCycles={sampleAuditCycles}
			fetchAuditCycles={fetchAuditCycles}
			router={mockRouter}
		/>);

		r.find("Modal").simulate("close");
		expect(mockRouter.goBack).toBeCalled();
	});
});
