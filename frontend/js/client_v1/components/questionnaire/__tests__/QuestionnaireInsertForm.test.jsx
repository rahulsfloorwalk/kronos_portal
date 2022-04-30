import React from "react";
import renderer from "react-test-renderer";

import QuestionnaireInsertForm from "../QuestionnaireInsertForm.jsx";

import { fetchIndustry } from "../../../service/questionnaire.js";

jest.mock("../../../service/questionnaire.js");

describe(QuestionnaireInsertForm, () => {
	const sampleIndustries = [
		{
			"id": 1,
			"name": "Automobile"
		},
		{
			"id": 2,
			"name": "Banking/Finance"
		}
	];

	const sampleParams = {
		auditCycleId: "6",
	};

	beforeEach(() => {
		fetchIndustry.mockResolvedValue(sampleIndustries);
	});

	it("renders an empty form", () => {
		const r = renderer.create(<QuestionnaireInsertForm params={sampleParams}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});