
import { findModeratorByUserId, findModerators } from "../moderator";

const sampleModerators = [
	{
		id: 1,
		sequence: 2,
		name: "Hello World",
		max_marks: 4,
		audit_cycle: 4,
	},
];

const sampleStore = {
	moderator: sampleModerators,
};

describe(findModeratorByUserId, () => {

	it("should return the moderator with the given user id", () => {
		expect(findModeratorByUserId(sampleStore, 1)).toEqual(sampleModerators[0]);
	});

	it("should return undefined when the moderator with given id is not found", () => {
		expect(findModeratorByUserId(sampleStore, 2)).toBeUndefined();
	});
});

describe(findModerators, () => {

	it("should return the list of moderators", () => {
		expect(findModerators(sampleStore)).toEqual(sampleModerators);
	});

	it("should return an empty list when the moderator is empty", () => {
		expect(findModerators({moderator: []})).toEqual([]);
	});
});
