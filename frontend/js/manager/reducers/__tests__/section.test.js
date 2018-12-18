
import rootReducer from "../../reducers.js";

import types from "../../action_types";

import { updateSections, updateSection } from "../section";

const sampleSections = [
	{
		id: 5,
		name: "Billiards Section",
		audit_cycle: 6,
	},
	{
		id: 6,
		name: "Tralfamador",
		audit_cycle: 6,
	}
];

describe("section reducer", () => {
	describe(types.SECTION_ID_GET, () => {
		it("updates the given section", () => {
			const nextState = rootReducer({}, updateSection(sampleSections[0]));

			expect(nextState.sections).toEqual({
				[sampleSections[0].id]: sampleSections[0],
			});
		});
	});

	describe(types.SECTION_GET, () => {
		it("updates the given sections", () => {
			const nextState = rootReducer({}, updateSections(sampleSections));

			expect(nextState.sections).toEqual({
				[sampleSections[0].id]: sampleSections[0],
				[sampleSections[1].id]: sampleSections[1],
			});
		});
	});
});

describe(updateSection, () => {
	it("returns an action to update a given section", () => {
		expect(updateSection(sampleSections[0])).toEqual({
			type: types.SECTION_ID_GET,
			status: "success",
			section: sampleSections[0],
		});
	});
});

describe(updateSections, () => {
	it("returns an action to update the given sections", () => {
		expect(updateSections(sampleSections)).toEqual({
			type: types.SECTION_GET,
			status: "success",
			sections: sampleSections,
		});
	});
});
