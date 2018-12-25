
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.ANSWER_GET, () => {
	const actionType = types.ANSWER_GET;
	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});
		it("it clears the answers", () => {
			expect(nextState.answers).toEqual({});
		});
	});

	describe("when status is success", () => {
		const sampleAnswers = [
			{
				id: 1,
				question_id: 1,
				marks_obtained: 1,
			},
			{
				id: 2,
				question_id: 2,
				marks_obtained: 1,
			},
		];

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				answers: sampleAnswers,
			});
		});

		it("converts a list of answers into an object", () => {
			expect(nextState.answers).toEqual({
				[sampleAnswers[0].id]: sampleAnswers[0],
				[sampleAnswers[1].id]: sampleAnswers[1],
			});
		});
	});
});

describe(types.ANSWER_POST, () => {
	const actionType = types.ANSWER_POST;
	describe("when status is success", () => {
		const sampleAnswer = {
			id: 2,
			question_id: 2,
			marks_obtained: 1,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				answer: sampleAnswer,
			});
		});

		it("sets the answer at it's ID", () => {
			expect(nextState.answers[sampleAnswer.id]).toEqual(sampleAnswer);
		});
	});
});
