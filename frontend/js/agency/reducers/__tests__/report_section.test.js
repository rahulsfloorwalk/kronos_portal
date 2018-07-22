
import { findReportSection } from "../report_section.js";

describe("findReportSection", () => {
	const sampleStore = {
		reportSections: [
			{
				id: 1,
				audit_store_id: 1,
				section_id: 1,
			},
		],
	};

	it("it finds the reportSection from the store", () => {
		expect(findReportSection(sampleStore, 1, 1)).toEqual(sampleStore.reportSections[0]);
	});

	it("it returns undefined when the reportSection is not found", () => {
		expect(findReportSection(sampleStore, 1, 2)).toBeUndefined();
	});
});
