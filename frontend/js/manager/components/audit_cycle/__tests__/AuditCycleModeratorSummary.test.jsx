import React from "react";
import renderer from "react-test-renderer";

import { AuditCycleModeratorSummary } from "../AuditCycleModeratorSummary.jsx";

const sampleProps = {
	auditCycleId: 5,
	summary: {
		"1": {
			"ASSIGNED": 1,
			"COMPLETED": 4,
		},
		"2": {
			"SUBMITTED": 3,
			"PM_REVIEW": 8,
		},
	},
	moderators: [
		{
			id: 1,
			email: "sentinel@redis.com",
		},
		{
			id: 2,
			email: "warthog@pulmonary.com",
		},
	],
};

describe(AuditCycleModeratorSummary, () => {
	it("renders the moderator summary and moderator emails", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummaryByAuditCycle = jest.fn();

		const r = renderer.create(<AuditCycleModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummaryByAuditCycle={fetchModeratorSummaryByAuditCycle}
			{...sampleProps}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders a loading widget there is no summary", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummaryByAuditCycle = jest.fn();

		const r = renderer.create(<AuditCycleModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummaryByAuditCycle={fetchModeratorSummaryByAuditCycle}
			moderators={[]}
			summary={undefined}
			auditCycleId={sampleProps.auditCycleId}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the empty message when there are no rows", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummaryByAuditCycle = jest.fn();

		const r = renderer.create(<AuditCycleModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummaryByAuditCycle={fetchModeratorSummaryByAuditCycle}
			moderators={[]}
			summary={{}}
			auditCycleId={sampleProps.auditCycleId}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls fetchModerators prop when it is mounted", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummaryByAuditCycle = jest.fn();

		renderer.create(<AuditCycleModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummaryByAuditCycle={fetchModeratorSummaryByAuditCycle}
			{...sampleProps}
		/>);
		expect(fetchModerators).toBeCalled();
	});

	it("calls fetchModeratorSummaryByAuditCycle prop when it is mounted", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummaryByAuditCycle = jest.fn();

		renderer.create(<AuditCycleModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummaryByAuditCycle={fetchModeratorSummaryByAuditCycle}
			{...sampleProps}
		/>);
		expect(fetchModeratorSummaryByAuditCycle).toBeCalled();
	});
});
