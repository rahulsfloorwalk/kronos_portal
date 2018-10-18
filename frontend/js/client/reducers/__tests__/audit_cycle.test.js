import { FETCH_AUDIT_CYCLES, SELECT_AUDIT_CYCLE } from "../../action_types";
import auditCycleReducer from "../audit_cycle";

const sampleQuestionnaireType = {
	id: 45,
	name: "Python",
};

const sampleAuditCycles = [
	{
		id: 1,
		name: "Desert Eagle",
		questionnaire_type: {
			id: 34,
			name: "Monty",
		},
	},
	{
		id: 2,
		name: "Kalashnikov",
		questionnaire_type: sampleQuestionnaireType,
	},
	{
		id: 3,
		name: "Beretta",
		questionnaire_type: sampleQuestionnaireType,
	},
];

describe("auditCycleReducer", () => {

	it("gets the initial state", () => {
		const auditCycles = auditCycleReducer(undefined, {});
		expect(auditCycles).toEqual({
			auditCycles: [],
			selectedAuditCycleId: null,
		});
	});

	describe(FETCH_AUDIT_CYCLES, () => {
		it("sets the auditCycles", () => {
			const auditCycles = auditCycleReducer(undefined, {
				type: FETCH_AUDIT_CYCLES,
				auditCycles: sampleAuditCycles,
			});
			expect(auditCycles.auditCycles).toEqual(sampleAuditCycles);
		});
	});

	describe(SELECT_AUDIT_CYCLE, () => {
		it("sets the selected auditCycle", () => {
			const auditCycles = auditCycleReducer(undefined, {
				type: SELECT_AUDIT_CYCLE,
				selectedAuditCycleId: 2,
			});
			expect(auditCycles.selectedAuditCycleId).toEqual(2);
		});
	});
});

