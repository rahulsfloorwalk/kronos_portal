import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { QuestionnaireTypeTabs } from "../QuestionnaireTypeTabs";

describe(QuestionnaireTypeTabs, () => {
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
		{
			id: 3,
			name: "Flying",
			is_default: false,
		},
		{
			id: 4,
			name: "Circus",
			is_default: false,
		},
	];

	it("renders a loading sign when there are no questionnaire types", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		const r = renderer.create(<QuestionnaireTypeTabs
			onMount={onMount}
			onSelect={onSelect}
			questionnaireTypes={[]}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders nothing when only one questionnaire type exists", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		const r = renderer.create(<QuestionnaireTypeTabs
			onMount={onMount}
			onSelect={onSelect}
			questionnaireTypes={[sampleQuestionnaireTypes[1]]}
			selectedQuestionnaireType={sampleQuestionnaireTypes[1]}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the tabs with selected questionnaire type", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		const r = renderer.create(<QuestionnaireTypeTabs
			onMount={onMount}
			onSelect={onSelect}
			questionnaireTypes={sampleQuestionnaireTypes}
			selectedQuestionnaireType={sampleQuestionnaireTypes[1]}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onMount when it is mounted", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		renderer.create(<QuestionnaireTypeTabs
			onMount={onMount}
			onSelect={onSelect}
			questionnaireTypes={sampleQuestionnaireTypes}
			selectedQuestionnaireType={sampleQuestionnaireTypes[1]}
		/>);
		expect(onMount).toHaveBeenCalled();
	});

	it("calls onSelect when a tab is clicked", () => {
		const onMount = jest.fn();
		const onSelect = jest.fn();
		const r = shallow(<QuestionnaireTypeTabs
			onMount={onMount}
			onSelect={onSelect}
			questionnaireTypes={sampleQuestionnaireTypes}
			selectedQuestionnaireType={sampleQuestionnaireTypes[1]}
		/>);

		r.find("a").at(1).simulate("click");
		expect(onSelect).toHaveBeenCalledWith(2);
	});
});
