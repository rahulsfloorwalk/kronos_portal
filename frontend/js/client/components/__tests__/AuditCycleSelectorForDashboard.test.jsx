import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { AuditCycleSelectorForDashboard } from "../AuditCycleSelectorForDashboard";

const sampleAuditCycles = [
	{
		id: 1,
		name: "Monty",
		start_date: "2018-07-01",
		end_date: "2018-08-01",
	},
	{
		id: 2,
		name: "Python",
		start_date: "2018-08-01",
		end_date: "2018-09-01",
	},
	{
		id: 3,
		name: "Flying",
		start_date: "2018-09-01",
		end_date: "2018-10-01",
	},
	{
		id: 4,
		name: "Circus",
		start_date: "2018-10-01",
		end_date: "2018-11-01",
	},
];

describe(AuditCycleSelectorForDashboard, () => {
	it("renders nothing when nothing is selected", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		const r = renderer.create(<AuditCycleSelectorForDashboard
			onMount={onMount}
			onSelect={onSelect}
			auditCycles={sampleAuditCycles}
			selectedAuditCycle={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
	it("renders the selector with selected audit cycle", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		const r = renderer.create(<AuditCycleSelectorForDashboard
			onMount={onMount}
			onSelect={onSelect}
			auditCycles={sampleAuditCycles}
			selectedAuditCycle={sampleAuditCycles[1]}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onMount when it is mounted", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		renderer.create(<AuditCycleSelectorForDashboard
			onMount={onMount}
			onSelect={onSelect}
			auditCycles={sampleAuditCycles}
			selectedAuditCycle={sampleAuditCycles[1]}
		/>);
		expect(onMount).toHaveBeenCalled();
	});

	it("calls onSelect when an option is selected", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		const r = shallow(<AuditCycleSelectorForDashboard
			onMount={onMount}
			onSelect={onSelect}
			auditCycles={sampleAuditCycles}
			selectedAuditCycle={sampleAuditCycles[1]}
		/>);

		r.find("select").simulate("change", { target: { value: String(sampleAuditCycles[1].id) }});
		expect(onSelect).toHaveBeenCalledWith(2);
	});
});
