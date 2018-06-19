import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import QuestionnaireTypeList, { __QuestionnaireTypeList } from "../../../../manager/components/questionnaire_type/QuestionnaireTypeList";
import { fetchQuestionnaireTypes, deleteQuestionnaireType } from "../../../../manager/service/questionnaire_type.js";

jest.mock("../../../../manager/service/questionnaire_type.js");

const sampleParams = {
	clientId: "5",
};

const sampleClientId = parseInt(sampleParams.clientId);

const sampleQuestionnaireTypes = [
	{
		id: 6,
		name: "Hello",
		is_default: true,
	},{
		id: 8,
		name: "World",
		is_default: false,
	},{
		id: 2,
		name: "Foobar",
		is_default: false,
	},
];

describe("<__QuestionnaireTypeList/>", () => {
	it("renders correctly when questionnaire types are loading", () => {
		const onDelete = jest.fn();
		const tree = renderer
			.create(<__QuestionnaireTypeList loading={true} clientId={sampleClientId} questionnaireTypes={[]} onDelete={onDelete}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders correctly when questionnaire types are loaded", () => {
		const onDelete = jest.fn();
		const tree = renderer
			.create(<__QuestionnaireTypeList loading={false} clientId={sampleClientId} questionnaireTypes={sampleQuestionnaireTypes} onDelete={onDelete}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders correctly when questionnaire types are empty", () => {
		const onDelete = jest.fn();
		const tree = renderer
			.create(<__QuestionnaireTypeList loading={false} clientId={sampleClientId} questionnaireTypes={[]} onDelete={onDelete}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("calls onDelete prop when the delete button is clicked", () => {
		const onDelete = jest.fn();
		const r = shallow(<__QuestionnaireTypeList loading={false} clientId={sampleClientId} questionnaireTypes={sampleQuestionnaireTypes} onDelete={onDelete}/>);
		r.find("button").at(1).simulate("click");
		expect(onDelete).toBeCalledWith(sampleQuestionnaireTypes[1]);
	});
});

describe("<QuestionnaireTypeList/>", () => {

	beforeEach(() => {
		fetchQuestionnaireTypes.mockReturnValue($.Deferred().resolve(sampleQuestionnaireTypes).promise());
	});

	it("calls fetchQuestionnaireTypes", () => {
		shallow(<QuestionnaireTypeList params={sampleParams}/>);
		expect(fetchQuestionnaireTypes).toBeCalledWith(sampleParams.clientId);
	});

	it("calls fetchQuestionnaireTypes when props are changed", () => {
		const nextProps = {
			params: {
				clientId: "7",
			},
		};
		const r = shallow(<QuestionnaireTypeList params={sampleParams}/>);
		r.setProps(nextProps);
		expect(fetchQuestionnaireTypes).lastCalledWith(nextProps.params.clientId);
	});

	it("passes loading to true while data is loading", () => {
		const r = shallow(<QuestionnaireTypeList params={sampleParams}/>);
		expect(r.find(__QuestionnaireTypeList).prop("loading")).toEqual(true);
	});

	it("passes loading as false once data is loaded", (done) => {
		const r = shallow(<QuestionnaireTypeList params={sampleParams}/>);
		setTimeout(() => {
			r.update();
			expect(r.find(__QuestionnaireTypeList).prop("loading")).toEqual(false);
			done();
		});
	});

	it("passes loaded questionnaire types as props to __QuestionnaireTypeList", (done) => {
		const r = shallow(<QuestionnaireTypeList params={sampleParams}/>);
		setTimeout(() => {
			r.update();
			expect(r.find(__QuestionnaireTypeList).prop("questionnaireTypes")).toEqual(sampleQuestionnaireTypes);
			done();
		});
	});

	it("calls deleteQuestionnaireType with the correct id", (done) => {
		deleteQuestionnaireType.mockResolvedValue(null);
		const r = shallow(<QuestionnaireTypeList params={sampleParams}/>);
		setTimeout(() => {
			r.update();
			r.find(__QuestionnaireTypeList).simulate("delete", sampleQuestionnaireTypes[0]);
			expect(deleteQuestionnaireType).toBeCalledWith(sampleQuestionnaireTypes[0].id);
			done();
		});
	});

	it("calls fetchQuestionnaireTypes after deleting an item", (done) => {
		deleteQuestionnaireType.mockResolvedValue(null);
		const r = shallow(<QuestionnaireTypeList params={sampleParams}/>);
		setTimeout(() => {
			r.update();
			r.find(__QuestionnaireTypeList).simulate("delete", sampleQuestionnaireTypes[0]);
			setTimeout(() => {
				expect(fetchQuestionnaireTypes).toHaveBeenCalledTimes(2);
				expect(fetchQuestionnaireTypes).lastCalledWith(sampleParams.clientId);
				done();
			});
		});
	});
});

