
import { FETCH_SECTIONS } from "../../action_types";
import sectionReducer, { findSection, findSectionsByAuditStoreId } from "../section.js";

const sampleAuditStoreId = 1;
const sampleSections = [
	{
		id: 1,
	},
];

describe("sectionReducer", () => {
	describe(FETCH_SECTIONS, () => {
		it("should set the section in the auditStoreId as key", () => {
			const action = {
				type: FETCH_SECTIONS,
				sections: sampleSections,
				auditStoreId: sampleAuditStoreId,
			};
			const result = sectionReducer(undefined, action);
			expect(result).toEqual({
				[sampleAuditStoreId]: sampleSections,
			});
		});
	});
});

describe("findSection", () => {
	const sampleStore = {
		sections: {
			[sampleAuditStoreId]: sampleSections,
		},
	};

	it("finds the section from the store", () => {
		expect(findSection(sampleStore, sampleAuditStoreId, 1)).toEqual(sampleSections[0]);
	});

	it("returns undefined when the section is not found", () => {
		expect(findSection(sampleStore, sampleAuditStoreId, 2)).toBeUndefined();
	});
});

describe("findSectionsByAuditStoreId", () => {
	const sampleStore = {
		sections: {
			[sampleAuditStoreId]: sampleSections,
		},
	};

	it("finds the sections by audit store id from the store", () => {
		expect(findSectionsByAuditStoreId(sampleStore, sampleAuditStoreId)).toEqual(sampleSections);
	});

	it("returns an empty array when no sections exist for the given audit store id", () => {
		expect(findSectionsByAuditStoreId(sampleStore, 2)).toEqual([]);
	});
});
