import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { DownloadDetailsButton } from "../DownloadDetailsButton";

const sampleAuditCycle = {
	id: 1,
	name: "July 2018",
};

describe(DownloadDetailsButton, () => {
	it("renders nothing when auditCyle is not provided", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<DownloadDetailsButton
			auditCycle={undefined}
			cityId={2}
			storeType="FOO"
			storePriority="BAR"
			startDate="2018-06-01"
			endDate="2018-06-30"
			reportAttributes={{"foo" : "bar"}}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
	it("renders the button with the generated link", () => {
		const onSelect = jest.fn();
		const r = renderer.create(<DownloadDetailsButton
			auditCycle={sampleAuditCycle}
			cityId={2}
			storeType="FOO"
			storePriority="BAR"
			startDate="2018-06-01"
			endDate="2018-06-30"
			reportAttributes={{"foo" : "bar"}}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
