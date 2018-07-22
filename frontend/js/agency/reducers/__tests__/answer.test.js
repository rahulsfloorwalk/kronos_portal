import { findAnswer } from "../answer.js";

describe("findAnswer", () => {
	const sampleStore = {
		answers: [
			{
				id: 3,
				audit_store_id: 1,
				question_id: 2,
			},
		],
	};

	it("it finds the answer from the store", () => {
		const answer = findAnswer(sampleStore, 1, 2);
		expect(answer).toEqual(sampleStore.answers[0]);
	});

	it("it returns undefined when the answer is not found", () => {
		const answer = findAnswer(sampleStore, 1, 3);
		expect(answer).toBeUndefined();
	});
});
