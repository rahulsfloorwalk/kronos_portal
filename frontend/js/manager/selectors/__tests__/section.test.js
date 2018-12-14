import { findSectionsByAuditCycleId } from "../section";

describe(findSectionsByAuditCycleId, () => {
	const sampleSections = {
		4: {
			id: 1,
			sequence: 2,
			name: "Hello World",
			max_marks: 4,
			audit_cycle: 4,
		},
		5: {
			id: 2,
			sequence: 1,
			name: "Bye World",
			max_marks: 3,
			audit_cycle: 4,
		},
		6: {
			id: 3,
			sequence: 1,
			name: "Slartibartfast",
			max_marks: 2,
			audit_cycle: 5,
		},
	};
	const sampleStore = {
		sections: sampleSections,
	};

	it("should return the sections with given audit cycle id, sorted by sequence", () => {
		expect(findSectionsByAuditCycleId(sampleStore, 4)).toEqual([sampleSections[5], sampleSections[4]]);
	});

	it("should return an empty array when sections with given audit cycle id are not found", () => {
		expect(findSectionsByAuditCycleId(sampleStore, 2)).toEqual([]);
	});
});
