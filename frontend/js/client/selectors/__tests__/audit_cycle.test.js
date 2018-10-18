import AuditCycleSelectors from "../audit_cycle";

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
	let questionnaireTypeSelectors;
	let selectors;

	beforeEach(() => {
		questionnaireTypeSelectors = {
			findSelectedQuestionnaireType: jest.fn(),
		};
		selectors = new AuditCycleSelectors(namespace, questionnaireTypeSelectors);
	});

	describe("findAuditCycles", () => {
		it("should return all the audit cycles", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);
			expect(selectors.findAuditCycles(sampleStore)).toEqual(sampleAuditCycles);
		});
	});

	describe("findSelectedAuditCycle", () => {
		it("should return the selected audit cycle with given questionnaire type when one is selected", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, 1, 0);
			expect(selectors.findSelectedAuditCycle(sampleStore, 34).id).toEqual(sampleAuditCycles[0].id);
		});

		it("should return the first audit cycle with given questionnaire type when the selected cycle is not of given questionnaire type", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, 0);
			expect(selectors.findSelectedAuditCycle(sampleStore, 45).id).toEqual(sampleAuditCycles[1].id);
		});

		it("should return the first audit cycle with given questionnaire type when there is no default", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);
			expect(selectors.findSelectedAuditCycle(sampleStore, 45).id).toEqual(sampleAuditCycles[1].id);
		});

		it("should return undefined when there are no audit cycles", () => {
			const sampleStore = createSampleStore(namespace, [], null, null);
			expect(selectors.findSelectedAuditCycle(sampleStore, 45)).toBeUndefined();
		});
	});

	describe("findFirstAuditCycle", () => {
		it("should return the first audit cycle", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);
			expect(selectors.findFirstAuditCycle(sampleStore).id).toEqual(sampleAuditCycles[0].id);
		});
		
		it("should return undefined if there are no audit cycles", () => {
			const sampleStore = createSampleStore(namespace, [], null, null);
			expect(selectors.findFirstAuditCycle(sampleStore)).toBeUndefined();
		});
	});

	describe("findFirstAuditCycleByQuestionnaireType", () => {
		it("should return the first audit cycle with the given questionnaire type", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);
			expect(selectors.findFirstAuditCycleByQuestionnaireType(sampleStore, 45).id).toEqual(sampleAuditCycles[1].id);
		});
	});

	describe("findAuditCyclesByQuestionnaireType", () => {
		it("should return the audit cycles with given quesionnaire type id", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);
			expect(selectors.findAuditCyclesByQuestionnaireType(sampleStore, sampleQuestionnaireType.id)).toHaveLength(2);
		});
	});

	describe("findAuditCyclesBySelectedQuestionnaireType", () => {
		it("should return auditCycles for the selected questionnaire type", () => {
			const sampleQuestionnaireType = { id: 45 };
			questionnaireTypeSelectors.findSelectedQuestionnaireType.mockReturnValue(sampleQuestionnaireType);
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);

			const auditCycles = selectors.findAuditCyclesBySelectedQuestionnaireType(sampleStore);
			expect(auditCycles).toHaveLength(2);
		});

		it("should return an empty array when no questionnaire type is selected", () => {
			questionnaireTypeSelectors.findSelectedQuestionnaireType.mockReturnValue(undefined);
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, null, null);

			const auditCycles = selectors.findAuditCyclesBySelectedQuestionnaireType(sampleStore);
			expect(auditCycles).toHaveLength(0);
		});
	});

	describe("findSelectedAuditCycleBySelectedQuestionnaireType", () => {
		it("should return the selected auditCycle for the selected questionnaire type", () => {
			const sampleQuestionnaireType = { id: 45 };
			questionnaireTypeSelectors.findSelectedQuestionnaireType.mockReturnValue(sampleQuestionnaireType);
			const sampleStore = createSampleStore(namespace, sampleAuditCycles, 0, 1);

			const auditCycle = selectors.findSelectedAuditCycleBySelectedQuestionnaireType(sampleStore);
			expect(auditCycle).toEqual(sampleAuditCycles[1]);
		});

		it("should return undefined when no audit cycles exist", () => {
			const sampleQuestionnaireType = { id: 45 };
			questionnaireTypeSelectors.findSelectedQuestionnaireType.mockReturnValue(sampleQuestionnaireType);
			const sampleStore = createSampleStore(namespace, [], null, null);

			const auditCycle = selectors.findSelectedAuditCycleBySelectedQuestionnaireType(sampleStore);
			expect(auditCycle).toBeUndefined();
		});

		it("should return undefined when no questionnaire type is selected", () => {
			questionnaireTypeSelectors.findSelectedQuestionnaireType.mockReturnValue(undefined);
			const sampleStore = createSampleStore(namespace, [], null, null);

			const auditCycle = selectors.findSelectedAuditCycleBySelectedQuestionnaireType(sampleStore);
			expect(auditCycle).toBeUndefined();
		});
	});
});
