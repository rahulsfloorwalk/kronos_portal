import React from "react";
import renderer from "react-test-renderer";

import AuditStoreReportAttributeRow from "../AuditStoreReportAttributeRow.jsx";

describe("<AuditStoreReportAttributeRow/>", () => {
	const sampleReportAttribute = {
		id: 1,
		json_id: "test attribute",
		label: "Label 1",
		attribute_data: {
			version: 1,
			options: [
				{
					option_id: "opt1",
					option_label: "Option Label 1",
				},
				{
					option_id: "opt2",
					option_label: "Option Label 2",
				},
			],
		},
	};

	it("renders the selected option label correctly", () => {
		const r = renderer.create(<AuditStoreReportAttributeRow
			reportAttribute={sampleReportAttribute}
			selectedOptionId={sampleReportAttribute.attribute_data.options[0].option_id}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders blank option label when option id is not selected", () => {
		const r = renderer.create(<AuditStoreReportAttributeRow
			selectedOptionId={undefined}
			reportAttribute={sampleReportAttribute}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
