import React from "react";
import Datetime from "react-datetime";
import moment from "moment";
import { shallow } from "enzyme";
import ShallowRenderer from "react-test-renderer/shallow";
import $ from "jquery";

import { ReportBrowser3 } from "../ReportBrowser3";
import AuditStoreTable from "../AuditStoreTable";
import { findAuditStoresByAuditCycle } from "../../service/audit_store";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

jest.mock("../../../client/service/audit_store");

const sampleAuditCycles = [
	{
		"id":109,
		"start_date":"2018-03-12",
		"end_date":"2018-05-31",
		"name":"Wave-1- 2018",
		"type":"WALKIN",
	},
	{
		"id":129,
		"start_date":"2018-03-12",
		"end_date":"2018-05-31",
		"name":"Wave-1- 2018",
		"type":"WALKIN",
	},
];

describe(ReportBrowser3, () => {
	const renderer = new ShallowRenderer();

	it("renders the audit store table with correct props", () => {
		const tree = renderer.render(<ReportBrowser3 auditCycles={sampleAuditCycles} selectedAuditCycle={sampleAuditCycles[1]}/>);
		expect(tree).toMatchSnapshot();
	});

	it("renders a message when there are no audit cycles", () => {
		const tree = renderer.render(<ReportBrowser3 auditCycles={[]} selectedAuditCycle={undefined}/>);
		expect(tree).toMatchSnapshot();
	});

	it("renders a loading widget when no cycle is selected", () => {
		const tree = renderer.render(<ReportBrowser3 auditCycles={sampleAuditCycles} selectedAuditCycle={undefined}/>);
		expect(tree).toMatchSnapshot();
	});
});

describe(AuditStoreTable, () => {
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
		"store_type": "10 pairs",
		"total_score": {
			"percentage": 73,
			"max_marks": 56,
			"color": 3,
		},
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
		"store_type": "5 pairs",
		"total_score": {
			"percentage": 73,
			"max_marks": 56,
			"color": 3,
		},
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
			r.find("select").at(2).simulate("change", {
				target: {
					value: "ONE",
				},
			});
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

	it("resets the selected priority when props are changed", (done) => {
		const promise = $.Deferred();
		findAuditStoresByAuditCycle.mockReturnValue(promise);
		promise.resolve(sampleAuditStores);

		const r = shallow(<AuditStoreTable {...sampleProps}/>);
		setTimeout(() => {
			r.update();
			r.find("select").at(2).simulate("change",  {
				target: {
					value: "ONE",
				},
			});
			r.setProps({
				auditCycleId: 45,
				startDate: "2018-04-01",
				endDate: "2018-04-30",
			});
			setTimeout(() => {
				expect(r.state("selectedPriority")).toEqual("");
				done();
			});
		});
	});

	it("resets the selected city when props are changed", (done) => {
		const promise = $.Deferred();
		findAuditStoresByAuditCycle.mockReturnValue(promise);
		promise.resolve(sampleAuditStores);

		const r = shallow(<AuditStoreTable {...sampleProps}/>);
		setTimeout(() => {
			r.update();
			r.find("select").at(2).simulate("change",  {
				target: {
					value: "641",
				},
			});
			r.setProps({
				auditCycleId: 45,
				startDate: "2018-04-01",
				endDate: "2018-04-30",
			});
			setTimeout(() => {
				expect(r.state("selectedCityId")).toEqual("");
				done();
			});
		});
	});

	it("resets the selected store type when props are changed", (done) => {
		const promise = $.Deferred();
		findAuditStoresByAuditCycle.mockReturnValue(promise);
		promise.resolve(sampleAuditStores);

		const r = shallow(<AuditStoreTable {...sampleProps}/>);
		setTimeout(() => {
			r.update();
			r.find("select").at(2).simulate("change",  {
				target: {
					value: "10 pairs",
				},
			});
			r.setProps({
				auditCycleId: 45,
				startDate: "2018-04-01",
				endDate: "2018-04-30",
			});
			setTimeout(() => {
				expect(r.state("selectedType")).toEqual("");
				done();
			});
		});
	});
});
