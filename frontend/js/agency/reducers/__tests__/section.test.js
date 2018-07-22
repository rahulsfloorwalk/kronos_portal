
import { findSection } from "../section.js";

describe("findSection", () => {
	const sampleStore = {
		sections: [
			{
				id: 1,
			},
		],
	};

	it("it finds the section from the store", () => {
		expect(findSection(sampleStore, 1)).toEqual(sampleStore.sections[0]);
	});

	it("it returns undefined when the section is not found", () => {
		expect(findSection(sampleStore, 2)).toBeUndefined();
	});
});
