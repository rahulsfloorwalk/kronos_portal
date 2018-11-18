import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import StorePerformance from "../StorePerformance.jsx";
import { fetchStorePerformance } from "../../service/store.js";

jest.mock("../../service/store.js");

function createNodeMock() {
	const doc = document.implementation.createHTMLDocument();
	return { parentElement: doc.body };
}

const sampleStoreId = 5;

const sampleQuestionnaireType = {
	"id": 1,
	"name": "Walk In",
	"is_default": true,
	"client_id": 1
};

const sampleChartData = {
	"scores": [
		149.0,
		132.0,
		129.0,
		116.0,
		146.0
	],
	"audit_cycle": [
		"Arena audits- September 2017",
		"Arena- October 2017",
		"Arena- November 2017",
		"Arena December- 2017",
		"Arena January 2018"
	],
	"max_marks": [
		166,
		166,
		166,
		165,
		165
	],
	"color_codes": [
		5,
		4,
		3,
		2,
		3
	]
};

//TODO - fix snapshot test. Snapshot does not contain chart
describe("<StorePerformance/>", () => {
	beforeEach(() => {
		fetchStorePerformance.mockReturnValue($.Deferred().resolve(sampleChartData).promise());
	});

	it("renders the StorePerformance chart correctly", (done) => {
		const r = renderer.create(<StorePerformance store_id={sampleStoreId} questionnaireType={sampleQuestionnaireType}/>, { createNodeMock });
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
	it("calls fetchStorePerformance with the correct store and questionnaire type id", () => {
		shallow(<StorePerformance store_id={sampleStoreId} questionnaireType={sampleQuestionnaireType}/>);
		expect(fetchStorePerformance).toHaveBeenCalledWith(sampleStoreId, sampleQuestionnaireType.id);
	});

	it("calls fetchStorePerformance when the props are changed", (done) => {
		const r = shallow(<StorePerformance store_id={sampleStoreId} questionnaireType={sampleQuestionnaireType}/>);
		setTimeout(() => {
			r.setProps({
				store_id: 6,
			});
			expect(fetchStorePerformance).lastCalledWith(6, sampleQuestionnaireType.id);
			done();
		});
	});
});
