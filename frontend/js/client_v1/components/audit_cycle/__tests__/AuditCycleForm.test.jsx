import React from "react";
import renderer from "react-test-renderer";

import { AuditCycleForm } from "../AuditCycleForm";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

let dateNowSpy;

beforeAll(() => {
	// Lock Time
	dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => 1524910191000);
});
afterAll(() => {
	// Unlock Time
	dateNowSpy.mockReset();
	dateNowSpy.mockRestore();
});

const addFormProps = {
	clientId: "2",
};

const editFormProps = {
	auditCycleId: "5",
};

const sampleAuditCycle = {
	"id": 81,
	"name": "Pilot December 2017",
	"type": "WALKIN",
	"status": "ARCHIVED",
	"start_date": "2017-12-19",
	"end_date": "2017-12-31",
	"earnings_per_audit": 300,
	"reimbursement": 200,
	"description": "This is a disclosed survey.",
	"post_approval_description": "Hello World",
	"client": {
		"id": 28,
		"name": "Amazon",
		"brand_name": "Amazon",
		"email": "foo@bar.com",
		"phone": "",
		"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/amazon_logo_RGB.jpg",
		"brand_logo_url": ""
	},
	"audit_count": 310,
	"questionnaire_type": {
		"id": 18,
		"name": "Seriously? Though.",
		"is_default": false,
		"client": 28,
		"client_id": 28
	},
};

describe("<AuditCycleForm/>", () => {
	it("renders an empty form correctly", () => {
		const tree = renderer
			.create(<AuditCycleForm params={addFormProps} dispatch={jest.fn()} errors={{}}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("renders the loaded values correctly", () => {
		const r = renderer.create(<AuditCycleForm params={editFormProps} dispatch={jest.fn()} errors={{}}/>);
		r.update(<AuditCycleForm params={editFormProps} auditCycle={sampleAuditCycle} dispatch={jest.fn()} errors={{}}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

});

