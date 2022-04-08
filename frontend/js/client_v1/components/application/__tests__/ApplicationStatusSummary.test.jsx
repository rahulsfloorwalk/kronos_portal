import React from "react";

import { fetchApplicationStats } from "../../../service/audit_cycle_stats.js";

import renderer from "react-test-renderer";
import ApplicationStatusSummary from "../ApplicationStatusSummary.jsx";

jest.mock("../../../service/audit_cycle_stats.js");

const sampleApplicationStatus = [
	{
		"status": "APPLIED",
		"count": 5
	},
	{
		"status": "WAITLISTED",
		"count": 7
	},
	{
		"status": "APPROVED",
		"count": 53
	},
	{
		"status": "WITHDRAWN",
		"count": 8
	},
	{
		"status": "REJECTED",
		"count": 2
	}
];


describe("<ApplicationStatusSummary/>", () => {
	it("renders the application status summary correctly", (done) => {
		fetchApplicationStats.mockResolvedValue(sampleApplicationStatus);
		const r = renderer.create(<ApplicationStatusSummary auditCycleId={5} />);
		setTimeout(()=>{
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});