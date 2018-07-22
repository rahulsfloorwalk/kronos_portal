import React from "react";
import ShallowRenderer from "react-test-renderer/shallow";

import { __Section } from "../Section.jsx";

describe("<__Section/>", () => {
	const renderer = new ShallowRenderer();

	const sampleAuditStore = {
		id: 2,
		status: "ACKNOWLEDGED",
		audit_date: "2018-02-02",
		audit: {
			earnings_per_audit: 500,
			reimbursement: 400,
			post_approval_description: "Hello World",
			audit_cycle: {
				type: "WALKIN",
				client: {
					auditor_display_name: "Ravi",
				},
				post_approval_description: "Hello World",
			},
			store: {
				name: "Factory Outlet",
				address: "Shankar Nagar, Dharampeth, Nagpur",
			},
		},
	};

	const sampleSection = {
		id: 1,
		sequence: 1,
		name: "Personal Details",
		questions: [
			{
				id: 1,
				sequence: 1,
				question_txt: "How are you feeling today?",
				question_type: "PLAIN",
				question_data: {},
			},
		],
	};

	test.each([
		[true, ""],
		[true, "Hello World"],
		[false, ""],
		[false, "Hello World"],
	])("when showErrors is %s and auditorComment is '%s':", (showErrors, auditorComment) => {
		const tree = renderer.render(<__Section section={sampleSection} showErrors={showErrors} auditorComment={auditorComment} auditStoreId={sampleAuditStore.id} auditStore={sampleAuditStore}/>);
		expect(tree).toMatchSnapshot();
	});

	it("renders correctly when a section has no questions", () => {
		const section = Object.assign({}, sampleSection, { questions: [] });
		const tree = renderer.render(<__Section section={section} showErrors={false} auditorComment="" auditStoreId={sampleAuditStore.id} auditStore={sampleAuditStore}/>);
		expect(tree).toMatchSnapshot();
	});
});
