import { FETCH_AUDIT_CYCLES, SELECT_AUDIT_CYCLE } from "../../action_types";
import auditCycleReducer, { AuditCycleSelectors } from "../audit_cycle";

const sampleAuditCycles = [
	{
		id: 1,
		name: "Desert Eagle",
	},
	{
		id: 2,
		name: "Kalashnikov",
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

const createSampleStore = (namespace, auditCycles, defaultIdx, selectedIdx) => {
	return {
		[namespace]: {
			auditCycles: auditCycles.map((qt, idx) => idx === defaultIdx ? Object.assign({}, qt, {
				is_default: true,
			}) : qt),
			selectedAuditCycleId: auditCycles[selectedIdx] ? auditCycles[selectedIdx].id : null,
		},
	};
};

describe(AuditCycleSelectors, () => {
	const namespace = "foobar";

	describe(AuditCycleSelectors.findAuditCycles, () => {
		const selectors = new AuditCycleSelectors(namespace);
		it("should fetch the audit cycles", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);
			expect(selectors.findAuditCycles(sampleStore)).toEqual(sampleAuditCycles);
		});
	});

	describe(AuditCycleSelectors.findSelectedAuditCycle, () => {
		const selectors = new AuditCycleSelectors(namespace);
		it("should fetch the selected audit cycle when it is selected", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, 1, 0);
			expect(selectors.findSelectedAuditCycle(sampleStore).id).toEqual(sampleAuditCycles[0].id);
		});

		it("should fetch the first audit cycle when there is no default", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);
			expect(selectors.findSelectedAuditCycle(sampleStore).id).toEqual(sampleAuditCycles[0].id);
		});
	});

	describe(AuditCycleSelectors.findFirstAuditCycle, () => {
		const selectors = new AuditCycleSelectors(namespace);
		it("should fetch the first audit cycle", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);
			expect(selectors.findFirstAuditCycle(sampleStore).id).toEqual(sampleAuditCycles[0].id);
		});
	});
});
