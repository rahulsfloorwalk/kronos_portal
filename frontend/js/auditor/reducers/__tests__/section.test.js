
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.SECTION_GET, () => {
	const actionType = types.SECTION_GET;
	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});
		it("it clears the sections", () => {
			expect(nextState.sections).toEqual({});
		});
	});

	describe("when status is success", () => {
		const sampleSections = [
			{
				id: 1,
				name: "Magrathea",
				max_marks: 3,
			},
			{
				id: 2,
				name: "Bartholomew",
				max_marks: 5,
			},
		];

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				sections: sampleSections,
			});
		});

		it("converts a list of sections into an object", () => {
			expect(nextState.sections).toEqual({
				[sampleSections[0].id]: sampleSections[0],
				[sampleSections[1].id]: sampleSections[1],
			});
		});
	});
});
