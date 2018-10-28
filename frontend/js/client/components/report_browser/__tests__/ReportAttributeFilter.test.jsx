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
		const onSelect = jest.fn();
		const r = renderer.create(<ReportAttributeFilter
			onSelect={onSelect}
			reportAttribute={sampleReportAttribute}
			selectedOptionId={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the selector with selected option_id", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<ReportAttributeFilter
			onSelect={onSelect}
			reportAttribute={sampleReportAttribute}
			selectedOptionId={sampleReportAttribute.attribute_data.options[0].option_id}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls onSelect with the option_id when an option is selected", () => {
		const onSelect = jest.fn();
		const r = shallow(<ReportAttributeFilter
			onSelect={onSelect}
			reportAttribute={sampleReportAttribute}
			selectedOptionId={sampleReportAttribute.attribute_data.options[0].option_id}
		/>);

		const updatedOptionId = sampleReportAttribute.attribute_data.options[0].option_id;
		r.find("select").simulate("change", { target: { value: updatedOptionId }});
		expect(onSelect).toHaveBeenCalledWith(updatedOptionId);
	});
});
