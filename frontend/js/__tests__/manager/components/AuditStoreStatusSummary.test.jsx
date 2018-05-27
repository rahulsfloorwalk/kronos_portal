import React from "react";
import { shallow } from "enzyme";
import AuditStoreStatusSummary from "../../../manager/components/AuditStoreStatusSummary.jsx";
import renderer from "react-test-renderer";
import { fetchAuditStoreStats } from "../../../manager/service/audit_cycle_stats";

jest.mock("../../../manager/service/audit_cycle_stats");

describe("<AuditStoreStatusSummary/>", () => {
	const sampleStats = [
		{
			"status":"COMPLETED",
			"count":3,
		},
		{
			"status":"ASSIGNED",
			"count":6,
		},
		{
			"status":"ACKNOWLEDGED",
			"count":6,
		},
		{
			"status":"PM_REVIEW",
			"count":1,
		},
		{
			"status":"SUBMITTED",
			"count":3,
		},
		{
			"status":"FAILED",
			"count":4,
		}
	];

	it("is rendered correctly when stats are loading", () => {
		fetchAuditStoreStats.mockResolvedValue(sampleStats);
		const r = renderer.create(<AuditStoreStatusSummary auditCycleId={5}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when stats have successfully loaded", (done) => {
		fetchAuditStoreStats.mockResolvedValue(sampleStats);
		const r = renderer.create(<AuditStoreStatusSummary auditCycleId={5}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
	it("calls the stats service correctly", () => {
		fetchAuditStoreStats.mockResolvedValue(sampleStats);
		const r = shallow(<AuditStoreStatusSummary auditCycleId={5}/>);
		expect(fetchAuditStoreStats).toBeCalledWith(5);
	});
	it("sets the state correctly once data is loaded", (done) => {
		fetchAuditStoreStats.mockResolvedValue(sampleStats);
		const r = shallow(<AuditStoreStatusSummary auditCycleId={5}/>);
		setTimeout(() => {
			expect(r.state()).toEqual({
				"stats": sampleStats
			});
			done();
		});
	});
});
