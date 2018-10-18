import QuestionnaireTypeSelectors from "../questionnaire_type";

const sampleQuestionnaireTypes = [
	{
		id: 1,
		name: "Monty",
		is_default: false,
	},
	{
		id: 2,
		name: "Python",
		is_default: false,
	},
];

const createSampleStore = (namespace, questionnaireTypes, defaultIdx, selectedIdx) => {
	return {
		[namespace]: {
			questionnaireTypes: questionnaireTypes.map((qt, idx) => idx === defaultIdx ? Object.assign({}, qt, {
				is_default: true,
			}) : qt),
			selectedQuestionnaireTypeId: questionnaireTypes[selectedIdx] ? questionnaireTypes[selectedIdx].id : null,
		},
	};
};

describe(QuestionnaireTypeSelectors, () => {
	const namespace = "foobar";

	describe("findQuestionnaireTypes", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should return all the questionnaire types", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, null, null);
			expect(selectors.findQuestionnaireTypes(sampleStore)).toEqual(sampleQuestionnaireTypes);
		});

		it("should return an empty array if there are no questionnaire types", () => {
			const sampleStore = createSampleStore(namespace, [], null, null);
			expect(selectors.findQuestionnaireTypes(sampleStore)).toEqual([]);
		});
	});

	describe("findSelectedQuestionnaireType", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should return the selected questionnaire type when it is selected", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, 1, 0);
			expect(selectors.findSelectedQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[0].id);
		});

		it("should return the default questionnaire type when nothing is selected", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, 1, null);
			expect(selectors.findSelectedQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[1].id);
		});

		it("should return the first questionnaire type when there is no default", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, null, null);
			expect(selectors.findSelectedQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[0].id);
		});

		it("should return undefined if there are no questionnaire types", () => {
			const sampleStore = createSampleStore(namespace, [], null, null);
			expect(selectors.findSelectedQuestionnaireType(sampleStore)).toBeUndefined();
		});
	});

	describe("findDefaultQuestionnaireType", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should return the default questionnaire type", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, 1, null);
			expect(selectors.findDefaultQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[1].id);
		});

		it("should return undefined if there are no questionnaire types", () => {
			const sampleStore = createSampleStore(namespace, [], null, null);
			expect(selectors.findDefaultQuestionnaireType(sampleStore)).toBeUndefined();
		});
	});

	describe("findFirstQuestionnaireType", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should return the first questionnaire type", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, null, null);
			expect(selectors.findFirstQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[0].id);
		});

		it("should return undefined if there are no questionnaire types", () => {
			const sampleStore = createSampleStore(namespace, [], null, null);
			expect(selectors.findFirstQuestionnaireType(sampleStore)).toBeUndefined();
		});
	});
});
