
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.AUDIT_STORE_GET, () => {
	const actionType = types.AUDIT_STORE_GET;
	describe("when status is success", () => {
		const sampleAuditStores = [
			{
				id: 1,
				user_id: 2,
				audit_date: "2018-09-12",
				reimbursement: 200,
				earnings_per_audit: 500,
			},
			{
				id: 2,
				user_id: 3,
				audit_date: "2018-09-11",
				reimbursement: 300,
				earnings_per_audit: 500,
			},
		];
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				auditStores: sampleAuditStores,
			});
		});

		it("converts the list to a dict with keys as ID", () => {
			expect(nextState.auditStores).toEqual({
				[sampleAuditStores[0].id]: sampleAuditStores[0],
				[sampleAuditStores[1].id]: sampleAuditStores[1],
			});
		});
	});
});

describe.each([types.AUDIT_STORE_ID_GET, types.AUDIT_STORE_ID_SUBMIT, types.AUDIT_STORE_ID_ACKNOWLEDGE, types.REPORT_SUMMARY_POST])(
	"%s", (actionType) => {
		describe("when status is success", () => {
			const sampleAuditStore = {
				id: 1,
				user_id: 2,
				audit_date: "2018-09-12",
				reimbursement: 200,
				earnings_per_audit: 500,
			};
			let nextState;
			beforeEach(() => {
				nextState = rootReducer(undefined, {
					type: actionType,
					status: "success",
					auditStore: sampleAuditStore,
				});
			});

			it("sets the auditStore at it's ID", () => {
				expect(nextState.auditStores[sampleAuditStore.id]).toEqual(sampleAuditStore);
			});
		});
	});
