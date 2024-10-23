// import React from "react";
// import { shallow } from "enzyme";
// import AuditCycleDashboard from "../../../manager/components/AuditCycleDashboard.jsx";
// import renderer from "react-test-renderer";
// import { getDashboardAuditCycles } from "../../../manager/service/dashboard_audit_cycles";

// jest.mock("../../../manager/service/dashboard_audit_cycles");

// describe("<AuditCycleDashboard/>", () => {
// 	const sampleStats = [
// 		{
// 			"id": 133,
// 			"name": "Fine Dine April 2018",
// 			"status": "REPORT",
// 			"client": "Smaaash",
// 			"start_date": "2018-04-06",
// 			"end_date": "2018-04-15",
// 			"audit_count": 1,
// 			"stats": {
// 				"application": {
// 					"APPLIED": 32,
// 					"APPROVED": 1,
// 					"NOT_APPLIED": 0,
// 					"REJECTED": 0,
// 					"WAITLISTED": 0
// 				},
// 				"audit_store": {
// 					"ACCEPTED": 1,
// 					"ASSIGNED": 0,
// 					"FAILED": 0,
// 					"ACKNOWLEDGED": 0,
// 					"SUBMITTED": 0,
// 					"PM_REVIEW": 0,
// 					"COMPLETED": 0,
// 					"WITHDRAWN": 0,
// 					"REJECTED": 0
// 				}
// 			}
// 		},
// 	];

// 	it("is rendered correctly when the data are loading", () => {
// 		getDashboardAuditCycles.mockResolvedValue(sampleStats);
// 		const r = renderer.create(<AuditCycleDashboard/>);
// 		expect(r.toJSON()).toMatchSnapshot();
// 	});

// 	it("is rendered correctly when the data is successfully loaded", (done) => {
// 		getDashboardAuditCycles.mockResolvedValue(sampleStats);
// 		const r = renderer.create(<AuditCycleDashboard/>);
// 		setTimeout(() => {
// 			expect(r.toJSON()).toMatchSnapshot();
// 			done();
// 		});
// 	});

// 	it("calls the stats service correctly", () => {
// 		getDashboardAuditCycles.mockResolvedValue(sampleStats);
// 		shallow(<AuditCycleDashboard/>);
// 		expect(getDashboardAuditCycles).toBeCalled();
// 	});

// 	it("sets the state correctly once data is loaded", (done) => {
// 		getDashboardAuditCycles.mockResolvedValue(sampleStats);
// 		const r = shallow(<AuditCycleDashboard/>);
// 		setTimeout(() => {
// 			expect(r.state()).toEqual({
// 				"active_cycles": sampleStats
// 			});
// 			done();
// 		});
// 	});
// });





import React from "react";
import { shallow } from "enzyme";
import AuditCycleDashboard from "../../../manager/components/AuditCycleDashboard.jsx";
import renderer from "react-test-renderer";
import { getDashboardAuditCycles, getDashboardAuditCyclesdropdown } from "../../../manager/service/dashboard_audit_cycles";

jest.mock("../../../manager/service/dashboard_audit_cycles");

describe("<AuditCycleDashboard/>", () => {
	const sampleStats = [
		{
			"id": 133,
			"name": "Fine Dine April 2018",
			"status": "REPORT",
			"client": "Smaaash",
			"start_date": "2018-04-06",
			"end_date": "2018-04-15",
			"audit_count": 1,
			"stats": {
				"application": {
					"APPLIED": 32,
					"APPROVED": 1,
					"NOT_APPLIED": 0,
					"REJECTED": 0,
					"WAITLISTED": 0
				},
				"audit_store": {
					"ACCEPTED": 1,
					"ASSIGNED": 0,
					"FAILED": 0,
					"ACKNOWLEDGED": 0,
					"SUBMITTED": 0,
					"PM_REVIEW": 0,
					"COMPLETED": 0,
					"WITHDRAWN": 0,
					"REJECTED": 0
				}
			}
		},
	];

	const sampleDropdown = [
		{ id: 1, name: "Client 1" },
		{ id: 2, name: "Client 2" }
	];

	beforeEach(() => {
		// Mocking both services to return promises
		getDashboardAuditCycles.mockResolvedValue(sampleStats);
		getDashboardAuditCyclesdropdown.mockResolvedValue(sampleDropdown);
	});

	it("is rendered correctly when the data are loading", () => {
		const r = renderer.create(<AuditCycleDashboard />);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when the data is successfully loaded", (done) => {
		const r = renderer.create(<AuditCycleDashboard />);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("calls the stats and dropdown service correctly", () => {
		shallow(<AuditCycleDashboard />);
		expect(getDashboardAuditCycles).toBeCalled();
		expect(getDashboardAuditCyclesdropdown).toBeCalled();
	});

	it("sets the state correctly once data is loaded", (done) => {
		const r = shallow(<AuditCycleDashboard />);
		setTimeout(() => {
			expect(r.state()).toEqual({
				active_cycles: sampleStats,
				selectedClientState: "",
				client_dropdown: sampleDropdown,
			});
			done();
		});
	});
});