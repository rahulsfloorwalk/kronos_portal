
import { findModeratorSummaryByAuditCycleId } from "../audit_cycle_moderator_summary";

describe(findModeratorSummaryByAuditCycleId, () => {
	const sampleAuditCycleId = 5;
	const sampleSummary = {
		"foo": "bar",
	};
	const sampleStore = {
		auditCycleModeratorSummary: {
			[sampleAuditCycleId]: sampleSummary,
		},
	};
	it("returns the moderator summary for the given audit cycle id", () => {
		expect(findModeratorSummaryByAuditCycleId(sampleStore, sampleAuditCycleId)).toEqual(sampleSummary);
	});

	it("should return undefined when there is no moderator summary with given audit cycle id", () => {
		expect(findModeratorSummaryByAuditCycleId(sampleStore, 3)).toBeUndefined();
	});
});

