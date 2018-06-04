import React from "react";
import Datetime from 'react-datetime';
import moment from 'moment';
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import ReportBrowser3, { AuditStoreTable } from '../../../client/components/ReportBrowser3';
import { fetchAuditCycles } from '../../../client/service/audit_cycle';
import { findAuditStoresByAuditCycle } from "../../../client/service/audit_store";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

jest.mock('../../../client/service/audit_cycle');
jest.mock('../../../client/service/audit_store');

describe("<ReportBrowser3/>", () => {
	const sampleAuditCycles = [
		{
			"audit__audit_cycle__id":109,
			"audit__audit_cycle__start_date":"2018-03-12",
			"audit__audit_cycle__end_date":"2018-05-31",
			"audit__audit_cycle__name":"Wave-1- 2018",
			"audit__audit_cycle__type":"WALKIN",
		},
		{
			"audit__audit_cycle__id":129,
			"audit__audit_cycle__start_date":"2018-03-12",
			"audit__audit_cycle__end_date":"2018-05-31",
			"audit__audit_cycle__name":"Wave-1- 2018",
			"audit__audit_cycle__type":"WALKIN",
		},
	];

	it("selects first audit cycle on successfully loading audit cycle list", (done) => {
		fetchAuditCycles.mockResolvedValue(sampleAuditCycles);
		const r = shallow(<ReportBrowser3/>);
		setTimeout(() => {
			r.update();
			expect(r.find("select > option").length).toEqual(2);
			expect(r.find("select").prop("value")).toEqual(sampleAuditCycles[0].audit__audit_cycle__id);
			done();
		});
	});

	it("passes the id, startDate and endDate of the selected audit cycle to AuditStoreTable", (done) => {
		fetchAuditCycles.mockResolvedValue(sampleAuditCycles);
		const r = shallow(<ReportBrowser3/>);
		setTimeout(() => {
			r.update();
			expect(r.find("AuditStoreTable").prop("auditCycleId")).toEqual(sampleAuditCycles[0].audit__audit_cycle__id);
			expect(r.find("AuditStoreTable").prop("startDate")).toEqual(sampleAuditCycles[0].audit__audit_cycle__start_date);
			expect(r.find("AuditStoreTable").prop("endDate")).toEqual(sampleAuditCycles[0].audit__audit_cycle__end_date);
			r.find("select").simulate("change", {
				target: {
					value: r.find("option").at(1).prop("value"),
				},
			});
			r.update();
			expect(r.find("AuditStoreTable").prop("auditCycleId")).toEqual(sampleAuditCycles[1].audit__audit_cycle__id);
			expect(r.find("AuditStoreTable").prop("startDate")).toEqual(sampleAuditCycles[1].audit__audit_cycle__start_date);
			expect(r.find("AuditStoreTable").prop("endDate")).toEqual(sampleAuditCycles[1].audit__audit_cycle__end_date);
			done();
		});
	});
});

describe("<AuditStoreTable/>", () => {
	const sampleProps = {
		"auditCycleId":129,
		"startDate":"2018-05-01",
		"endDate":"2018-05-31",
	};

	const sampleAuditStores = [{
		"store_name": "ayoun the optic shop",
		"store_priority": "ONE",
		"audit_date": "2018-05-10",
		"city_id": 641,
		"audit_store_id": 3075,
		"city_name": "Bangalore",
		"store_id": 1461,
		"sections": [{
			"color": 1,
			"sequence": 1,
			"max_marks": 0,
			"section": "Audit Details",
			"percentage": 0
		}, {
			"color": 2,
			"sequence": 2,
			"max_marks": 4,
			"section": "Brand Pitch",
			"percentage": 50
		}, {
			"color": 4,
			"sequence": 3,
			"max_marks": 2,
			"section": "Recommendations",
			"percentage": 100
		}, {
			"color": 1,
			"sequence": 4,
			"max_marks": 4,
			"section": "Feedback",
			"percentage": 0
		}],
		"store_code": null,
		"store_type": "10 pairs"
	}, {
		"store_name": "aneesh vision vare",
		"store_priority": "TWO",
		"audit_date": "2018-05-20",
		"city_id": 641,
		"audit_store_id": 3049,
		"city_name": "Bangalore",
		"store_id": 1462,
		"sections": [{
			"color": 1,
			"sequence": 1,
			"max_marks": 0,
			"section": "Audit Details",
			"percentage": 0
		}, {
			"color": 2,
			"sequence": 2,
			"max_marks": 4,
			"section": "Brand Pitch",
			"percentage": 50
		}, {
			"color": 1,
			"sequence": 3,
			"max_marks": 2,
			"section": "Recommendations",
			"percentage": 0
		}, {
			"color": 1,
			"sequence": 4,
			"max_marks": 4,
			"section": "Feedback",
			"percentage": 0
		}],
		"store_code": null,
		"store_type": "5 pairs"
	}];

	it("sets startDate and endDate filters based on props", (done) => {
		const promise = $.Deferred();
		findAuditStoresByAuditCycle.mockReturnValue(promise);
		promise.resolve(sampleAuditStores);

		const r = shallow(<AuditStoreTable {...sampleProps}/>);
		setTimeout(() => {
			r.update();
			expect(r.find(Datetime).at(0).prop("value")).toEqual(moment(sampleProps.startDate));
			expect(r.find(Datetime).at(1).prop("value")).toEqual(moment(sampleProps.endDate));
			done();
		});
	});

	it("renders all the report rows received from the server", (done) => {
		const promise = $.Deferred();
		findAuditStoresByAuditCycle.mockReturnValue(promise);
		promise.resolve(sampleAuditStores);

		const r = shallow(<AuditStoreTable {...sampleProps}/>);
		setTimeout(() => {
			r.update();
			expect(r.find("tbody > tr").length).toEqual(2);
			done();
		});
	});

	it("filters reports based on priority filters", (done) => {
		const promise = $.Deferred();
		findAuditStoresByAuditCycle.mockReturnValue(promise);
		promise.resolve(sampleAuditStores);

		const r = shallow(<AuditStoreTable {...sampleProps}/>);
		setTimeout(() => {
			r.update();
			r.find(select).at(2).simulate("change", "ONE");
			r.update();
			expect(r.find("tbody > tr").length).toEqual(1);
			expect(r.find("tbody > tr > td").at(2).text()).toEqual("10th May 2018");
			done();
		});
	});

	it("filters reports based on start date filters", (done) => {
		const promise = $.Deferred();
		findAuditStoresByAuditCycle.mockReturnValue(promise);
		promise.resolve(sampleAuditStores);

		const r = shallow(<AuditStoreTable {...sampleProps}/>);
		setTimeout(() => {
			r.update();
			r.find(Datetime).at(0).simulate("change", moment("2018-05-15"));
			r.update();
			expect(r.find("tbody > tr").length).toEqual(1);
			expect(r.find("tbody > tr > td").at(2).text()).toEqual("20th May 2018");
			done();
		});
	});

	it("filters reports based on end date filters", (done) => {
		const promise = $.Deferred();
		findAuditStoresByAuditCycle.mockReturnValue(promise);
		promise.resolve(sampleAuditStores);

		const r = shallow(<AuditStoreTable {...sampleProps}/>);
		setTimeout(() => {
			r.update();
			r.find(Datetime).at(1).simulate("change", moment("2018-05-15"));
			r.update();
			expect(r.find("tbody > tr").length).toEqual(1);
			expect(r.find("tbody > tr > td").at(2).text()).toEqual("10th May 2018");
			done();
		});
	});
});
