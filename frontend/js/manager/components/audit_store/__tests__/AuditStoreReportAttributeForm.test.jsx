import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";


import {AuditStoreReportAttributeForm} from "../AuditStoreReportAttributeForm";

describe("AuditStoreReportAttributeForm", () => {
	const sampleReportAttribute = {
		id: 1,
		json_id: "test attribute",
		label: "Attribute Label 1",
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
	const sampleAuditStore = {
		"id": 3925,
		"status": "PM_REVIEW",
		"audit_date": "2018-06-09",
		"audit": {
			"audit_cycle": {
				"type": "WALKIN",
			},
			"store": {
				"name": "Store",
				"client": {
					"name": "Client",
				},
			},
		},
		"user": {
			"id": 4930,
			"email": "Supriyabaral0612@gmail.com",
			"profileinfo": {
				"id": 4782,
				"first_name": "Supriya",
				"last_name": "Baral",
				"mobile_number": "7400619309",
				"city": 296,
				"user_id": 4930
			}
		},
		"qa_rating": 2,
		"assigned_to_moderator": [
			5744
		],
		"attribute_data": {},
	};

	it("renders the form with no option selected", () => {
		const auditStore = Object.assign({}, sampleAuditStore, {
			"attribute_data": {},
		});
		const onSubmit = jest.fn();
		const onClose = jest.fn();
		const r = renderer.create(
			<AuditStoreReportAttributeForm
				onSubmit={onSubmit}
				onClose={onClose}
				reportAttribute={sampleReportAttribute}
				auditStore={auditStore}/>
		);
		expect(r).toMatchSnapshot();
	});

	it("renders the form with an option selected", () => {
		const auditStore = Object.assign({}, sampleAuditStore, {
			"attribute_data": {
				"test attribute": "opt1",
			}
		});
		const onSubmit = jest.fn();
		const onClose = jest.fn();
		const r = renderer.create(
			<AuditStoreReportAttributeForm
				onSubmit={onSubmit}
				onClose={onClose}
				reportAttribute={sampleReportAttribute}
				auditStore={auditStore}/>
		);
		expect(r).toMatchSnapshot();
	});

	it("calls onSubmit with the selected option when the form is submitted", () => {
		const selectedOptionId = "opt1";
		const onChangeEvent = { target: { value: selectedOptionId } };
		const onSubmitEvent = {
			target: {
				value: selectedOptionId
			},
			preventDefault: jest.fn(),
		};
		const onSubmit = jest.fn().mockResolvedValue(sampleAuditStore);
		const onClose = jest.fn();
		const r = shallow(
			<AuditStoreReportAttributeForm
				onSubmit={onSubmit}
				onClose={onClose}
				reportAttribute={sampleReportAttribute}
				auditStore={sampleAuditStore}/>
		);
		r.find("select").simulate("change", onChangeEvent);
		r.find("form").simulate("submit", onSubmitEvent);
		expect(onSubmitEvent.preventDefault).toHaveBeenCalled();
		expect(onSubmit).toHaveBeenCalledWith(sampleAuditStore.id, sampleReportAttribute.json_id, selectedOptionId);
	});

	it("closes the modal when the form is submitted successfully", (done) => {
		const selectedOptionId = "opt1";
		const onChangeEvent = { target: { value: selectedOptionId } };
		const onSubmitEvent = {
			target: {
				value: selectedOptionId
			},
			preventDefault: jest.fn(),
		};
		const onSubmit = jest.fn().mockResolvedValue(sampleAuditStore);
		const onClose = jest.fn();
		const r = shallow(
			<AuditStoreReportAttributeForm
				onSubmit={onSubmit}
				onClose={onClose}
				reportAttribute={sampleReportAttribute}
				auditStore={sampleAuditStore}/>
		);
		r.find("select").simulate("change", onChangeEvent);
		r.find("form").simulate("submit", onSubmitEvent);
		setTimeout(() => {
			expect(onClose).toHaveBeenCalled();
			done();
		});
	});

	it("calls onClose when the modal is closed", () => {
		const auditStore = Object.assign({}, sampleAuditStore, {
			"attribute_data": {
				"test attribute": "opt1",
			}
		});
		const onSubmit = jest.fn();
		const onClose = jest.fn();
		const r = shallow(
			<AuditStoreReportAttributeForm
				onSubmit={onSubmit}
				onClose={onClose}
				reportAttribute={sampleReportAttribute}
				auditStore={auditStore}/>
		);
		r.find("Modal").simulate("close", onClose);
		expect(onClose).toHaveBeenCalled();
	});
});