import { findSectionsByAuditCycleId, findQuestionnaireTotalForAuditCycleId } from "../section";

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

describe(findSectionsByAuditCycleId, () => {

	it("should return the sections with given audit cycle id, sorted by sequence", () => {
		expect(findSectionsByAuditCycleId(sampleStore, 4)).toEqual([sampleSections[5], sampleSections[4]]);
	});

	it("should return an empty array when sections with given audit cycle id are not found", () => {
		expect(findSectionsByAuditCycleId(sampleStore, 2)).toEqual([]);
	});
});

describe(findQuestionnaireTotalForAuditCycleId, () => {
	it("should summation of max_marks for sections with given audit cycle id ", () => {
		expect(findQuestionnaireTotalForAuditCycleId(sampleStore, 4)).toEqual(7);
	});

	it("should return zero when there are no sections for given audit cycle id ", () => {
		expect(findQuestionnaireTotalForAuditCycleId(sampleStore, 2)).toEqual(0);
	});
});
