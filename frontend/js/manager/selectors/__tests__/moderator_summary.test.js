
import { findModeratorSummary } from "../moderator_summary";

const sampleStore = {
	moderatorSummary: {
		1: {
			"ASSIGNED": 4,
		},
	},
};

describe(findModeratorSummary, () => {

	it("should return the moderator summary", () => {
		expect(findModeratorSummary(sampleStore)).toEqual(sampleStore.moderatorSummary);
	});

	it("should return an empty object when the moderator is empty", () => {
		expect(findModeratorSummary({moderatorSummary: {}})).toEqual({});
	});
});
