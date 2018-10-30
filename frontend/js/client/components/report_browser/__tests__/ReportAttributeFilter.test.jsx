import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { ReportAttributeFilter } from "../ReportAttributeFilter";

const sampleReportAttribute = {
	id: 1,
	json_id: "attribute1",
	label: "Label One",
	attribute_data: {
		version: 1,
		options: [
			{
				option_id: "option1",
				option_label: "Option Label 1",
			},
			{
				option_id: "option2",
				option_label: "Option Label 2",
			},
		],
	},
};

describe("ReportAttributeFilter", () => {
	it("renders the selector with nothing selected", () => {
		const selectReportAttributeOption = jest.fn();
		const r = renderer.create(<ReportAttributeFilter
			reportAttribute={sampleReportAttribute}
			selectedOptionId={undefined}
			selectReportAttributeOption={selectReportAttributeOption}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the selector with selected option_id", () => {
		const selectReportAttributeOption = jest.fn();
		const r = renderer.create(<ReportAttributeFilter
			reportAttribute={sampleReportAttribute}
			selectedOptionId={sampleReportAttribute.attribute_data.options[0].option_id}
			selectReportAttributeOption={selectReportAttributeOption}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onSelect with the option_id when an option is selected", () => {
		const selectReportAttributeOption = jest.fn();
		const r = shallow(<ReportAttributeFilter
			reportAttribute={sampleReportAttribute}
			selectedOptionId={sampleReportAttribute.attribute_data.options[0].option_id}
			selectReportAttributeOption={selectReportAttributeOption}
		/>);

		const updatedOptionId = sampleReportAttribute.attribute_data.options[0].option_id;
		r.find("select").simulate("change", { target: { value: updatedOptionId }});
		expect(selectReportAttributeOption).toHaveBeenCalledWith(sampleReportAttribute.json_id, updatedOptionId);
	});
});
