import React from "react";
import { shallow } from "enzyme";

import StorePerformance from "../StorePerformance.jsx";
import QuestionnaireTrends from "../QuestionnaireTrends.jsx";

import StoreTrends from "../StoreTrends.jsx";
import { fetchQuestionnaireTypes } from "../../service/dashboard.js";
jest.mock("../../service/dashboard.js");
import { fetchStore } from "../../service/store.js";
jest.mock("../../service/store.js");

const sampleParams = {
	storeId: "1097",
};

const sampleQuestionnaireTypes = [
	{
		"id": 180,
		"name": "Sky Karting",
		"is_default": false,
		"client_id": 9
	},
	{
		"id": 183,
		"name": "Fine Dine",
		"is_default": false,
		"client_id": 9
	},
	{
		"id": 184,
		"name": "Smaaash Arena",
		"is_default": false,
		"client_id": 9
	},
	{
		"id": 213,
		"name": "Walk In",
		"is_default": true,
		"client_id": 9
	}
];

const sampleStore = {
	"id": 1097,
	"code": null,
	"type": "Smaaash Arena",
	"priority": "",
	"name": "Chandigarh Elante Mall",
	"address": "Shop no- 309,310, 3rd Floor, Elante Mall, Industrial area, Phase-1",
	"city": {
		"id": 107,
		"name": "Chandigarh",
		"state": "IN-CH"
	},
	"client": {
		"id": 9,
		"name": "Smaaash",
		"email": "saurabh.sawhney@smaaash.in",
		"phone": "",
		"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
	}
};

describe("<StoreTrends/>", () => {
	beforeEach(() => {
		fetchStore.mockResolvedValue(sampleStore);
		fetchQuestionnaireTypes.mockResolvedValue(sampleQuestionnaireTypes);
	});

	it("it fetches the questionnaire types", () => {
		shallow(<StoreTrends params={sampleParams}/>);
		expect(fetchQuestionnaireTypes).toHaveBeenCalled();
	});

	it("it fetches the store by ID", () => {
		shallow(<StoreTrends params={sampleParams}/>);
		expect(fetchStore).toHaveBeenCalledWith(sampleParams.storeId);
	});

	it("selects the questionnaire type based on Store type", (done) => {
		const r = shallow(<StoreTrends params={sampleParams}/>);
		setTimeout(() => {
			r.update();
			expect(r.find("select").prop("value")).toEqual(String(sampleQuestionnaireTypes[2].id));
			expect(r.find(QuestionnaireTrends).prop("questionnaireType")).toEqual(sampleQuestionnaireTypes[2]);
			expect(r.find(StorePerformance).prop("questionnaireType")).toEqual(sampleQuestionnaireTypes[2]);
			done();
		});
	});

	it("selects the first questionnaire type based on when store type is not found", (done) => {
		fetchStore.mockResolvedValue(Object.assign({}, sampleStore, {
			type: "Foobar",
		}));
		const r = shallow(<StoreTrends params={{storeId: "1097"}}/>);
		setTimeout(() => {
			r.update();
			expect(r.find("select").prop("value")).toEqual(String(sampleQuestionnaireTypes[0].id));
			expect(r.find(QuestionnaireTrends).prop("questionnaireType")).toEqual(sampleQuestionnaireTypes[0]);
			expect(r.find(StorePerformance).prop("questionnaireType")).toEqual(sampleQuestionnaireTypes[0]);
			done();
		});
	});
});
