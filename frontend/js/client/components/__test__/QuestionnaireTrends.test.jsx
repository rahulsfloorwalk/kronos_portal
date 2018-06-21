import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import QuestionnaireTrends from "../QuestionnaireTrends.jsx";
import { fetchStoreMarkingTrends } from "../../service/store.js";

jest.mock("../../service/store.js");

const sampleStoreId = 5;

const sampleQuestionnaireType = {
	"id": 1,
	"name": "Walk In",
	"is_default": true,
	"client_id": 1
};

const sampleMarkingTrends = {
	"scores": [
		{
			"question_id": 4795,
			"sequence": 1,
			"max_marks": 1,
			"question_txt": "Visit Time in",
			"scores": [
				{
					"marks": 1,
					"color": 0
				},
				{
					"marks": 0,
					"color": 0
				},
			],
			"section_name": "Visit details",
			"section_sequence": 1
		},
		{
			"question_id": 4797,
			"sequence": 3,
			"max_marks": 0,
			"question_txt": "Bill amount for Gaming zone (Card recharge amount)",
			"scores": [
				{
					"marks": 0.0,
					"color": 0
				},
				{
					"marks": 0.0,
					"color": 0
				},
			],
			"section_name": "Visit details",
			"section_sequence": 1
		},
		{
			"question_id": 4796,
			"sequence": 2,
			"max_marks": 2,
			"question_txt": "Visit Time out",
			"scores": [
				{
					"marks": 2,
					"color": 0
				},
				{
					"marks": 1,
					"color": 0
				},
			],
			"section_name": "Visit details",
			"section_sequence": 1
		},
	],
	"audit_cycle": [
		"Arena audits- September 2017",
		"Arena- October 2017",
	],
};

describe("<QuestionnaireTrends/>", () => {
	beforeEach(() => {
		fetchStoreMarkingTrends.mockReturnValue($.Deferred().resolve(sampleMarkingTrends).promise());
	});

	it("renders the QuestionnaireTrends table correctly", (done) => {
		const r = renderer.create(<QuestionnaireTrends storeId={sampleStoreId} questionnaireType={sampleQuestionnaireType}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
	it("calls fetchStorePerformance with the correct store and questionnaire type id", () => {
		shallow(<QuestionnaireTrends storeId={sampleStoreId} questionnaireType={sampleQuestionnaireType}/>);
		expect(fetchStoreMarkingTrends).toHaveBeenCalledWith(sampleStoreId, sampleQuestionnaireType.id);
	});
});
