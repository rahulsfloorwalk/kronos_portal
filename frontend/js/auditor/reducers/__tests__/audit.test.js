
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.AUDIT_GET, () => {
	const actionType = types.AUDIT_GET;
	describe("when status is success", () => {
		const sampleAudits = [
			{
				id: 1,
				reimbursement: 100,
				earnings_per_audit: 200,
			},
			{
				id: 2,
				reimbursement: 100,
				earnings_per_audit: 200,
			},
		];
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				audits: sampleAudits,
			});
		});

		it("converts list of audits to an object", () => {
			expect(nextState.audits).toEqual({
				[sampleAudits[0].id]: sampleAudits[0],
				[sampleAudits[1].id]: sampleAudits[1],
			});
		});
	});
});

describe(types.AUDIT_ID_GET, () => {
	const actionType = types.AUDIT_ID_GET;

	describe("when status is success", () => {
		const sampleAudit = {
			id: 1,
			reimbursement: 100,
			earnings_per_audit: 200,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				audit: sampleAudit,
			});
		});

		it("sets the audit at the correct id", () => {
			expect(nextState.audits[sampleAudit.id]).toEqual(sampleAudit);
		});
	});
});
