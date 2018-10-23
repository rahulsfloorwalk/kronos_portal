import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { AuditStoreReportAttributesTable } from "../AuditStoreReportAttributesTable.jsx";

describe("<AuditStoreReportAttributesTable/>", () => {
	const sampleAuditStore = {
		id: 5,
		user: {
			profileinfo: {
				first_name: "John",
				last_name: "Doe",
			}
		},
		audit_date: "2018-09-02",
		earnings_per_audit: 2000,
		reimbursement: 5000,
		status: "PM_REVIEW",
		audit: {
			id: 134,
			earnings_per_audit: 2000,
			reimbursement: 5000,
			audit_cycle: {
				id: 165,
				type: "WALKIN",
			},
			store: {
				id: 123,
				name: "Hello World",
			},
		},
		attribute_data: {
			attribute1: "option1",
		},
	};
	const sampleReportAttributes = [
		{
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
		},
		{
			id: 2,
			json_id: "attribute2",
			label: "Label Two",
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
		},
	];

	it("renders the report attributes in a table", () => {
		const fetchReportAttributesByAuditCycleId = jest.fn();

		const r = renderer.create(<AuditStoreReportAttributesTable
			reportAttributes={sampleReportAttributes}
			auditStore={sampleAuditStore}
			auditStoreId={sampleAuditStore.id}

			fetchReportAttributesByAuditCycleId={fetchReportAttributesByAuditCycleId}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls the fetchReportAttributesByAuditCycleId prop on mount", () => {
		const fetchReportAttributesByAuditCycleId = jest.fn();

		const r = shallow(<AuditStoreReportAttributesTable
			reportAttributes={sampleReportAttributes}
			auditStore={sampleAuditStore}
			auditStoreId={sampleAuditStore.id}

			fetchReportAttributesByAuditCycleId={fetchReportAttributesByAuditCycleId}
		/>);
		expect(fetchReportAttributesByAuditCycleId).toBeCalledWith(sampleAuditStore.audit.audit_cycle.id);
	});

	it("calls the fetchReportAttributesByAuditCycleId prop when the auditStore prop changes", () => {
		const fetchReportAttributesByAuditCycleId = jest.fn();
		const newAuditStore = Object.assign({}, sampleAuditStore, { id: 45 });

		const r = shallow(<AuditStoreReportAttributesTable
			reportAttributes={sampleReportAttributes}
			auditStore={sampleAuditStore}
			auditStoreId={sampleAuditStore.id}

			fetchReportAttributesByAuditCycleId={fetchReportAttributesByAuditCycleId}
		/>);
		r.setProps({
			auditStore: newAuditStore,
		});
		expect(fetchReportAttributesByAuditCycleId).toHaveBeenCalledTimes(2);
		expect(fetchReportAttributesByAuditCycleId).lastCalledWith(newAuditStore.audit.audit_cycle.id);
	});

	it("does not call the fetchReportAttributesByAuditCycleId prop when the auditStore prop is not changed", () => {
		const fetchReportAttributesByAuditCycleId = jest.fn();

		const r = shallow(<AuditStoreReportAttributesTable
			reportAttributes={sampleReportAttributes}
			auditStore={sampleAuditStore}
			auditStoreId={sampleAuditStore.id}

			fetchReportAttributesByAuditCycleId={fetchReportAttributesByAuditCycleId}
		/>);
		r.setProps({
			auditStore: sampleAuditStore,
		});
		expect(fetchReportAttributesByAuditCycleId).toHaveBeenCalledTimes(1);
	});
});
