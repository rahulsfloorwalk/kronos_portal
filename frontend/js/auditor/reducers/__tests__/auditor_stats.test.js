
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.AUDITOR_STATS_GET, () => {
	const actionType = types.AUDITOR_STATS_GET;
	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("sets loading to true", () => {
			expect(nextState.loadingAuditorStats).toEqual(true);
		});
	});

	describe("when status is success", () => {
		const sampleStats = {
			foo: "bar",
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				auditorStats: sampleStats,
			});
		});

		it("sets loading to false", () => {
			expect(nextState.loadingAuditorStats).toEqual(false);
		});

		it("sets the auditor score", () => {
			expect(nextState.auditorStats).toEqual(sampleStats);
		});
	});
});

describe(types.AUDITOR_SCORE_GET, () => {
	const actionType = types.AUDITOR_SCORE_GET;
	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});

		it("sets loading to true", () => {
			expect(nextState.loadingAuditorScore).toEqual(true);
		});
	});

	describe("when status is success", () => {
		const sampleScore = {
			foo: "bar",
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				auditorScore: sampleScore,
			});
		});

		it("sets loading to false", () => {
			expect(nextState.loadingAuditorScore).toEqual(false);
		});

		it("sets the auditor score", () => {
			expect(nextState.auditorScore).toEqual(sampleScore);
		});
	});
});

