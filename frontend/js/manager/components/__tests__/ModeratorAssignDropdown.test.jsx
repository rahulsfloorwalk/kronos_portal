import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import { assignToModerator, revokeFromModerator } from "../../service/audit_store.js";
import ModeratorAssignDropdown from "../ModeratorAssignDropdown.jsx";

jest.mock("../../service/audit_store.js");

const sampleModerators = [
	{
		id: 1,
		email: "alize@canberra.com",
		is_active: true,
	},
	{
		id: 2,
		email: "bob@petersburg.ru",
		is_active: true,
	},
	{
		id: 3,
		email: "john@boyega.foo",
		is_active: false,
	},
];

const sampleAuditStoreId = 5;

describe("<ModeratorAssignDropdown/>", () => {
	it("renders the dropdown of moderators when no moderator is selected", () => {
		const onUpdate = jest.fn();
		const r = renderer.create(<ModeratorAssignDropdown auditStoreId={sampleAuditStoreId} moderators={sampleModerators} selectedModeratorId={[]} onUpdate={onUpdate}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the dropdown of moderators when a moderator is selected", () => {
		const onUpdate = jest.fn();
		const r = renderer.create(<ModeratorAssignDropdown auditStoreId={sampleAuditStoreId} moderators={sampleModerators} selectedModeratorId={[1]} onUpdate={onUpdate}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls assignToModerator when a moderator is selected", (done) => {
		const onUpdate = jest.fn();
		assignToModerator.mockResolvedValue("FOO");
		const r = shallow(<ModeratorAssignDropdown auditStoreId={sampleAuditStoreId} moderators={sampleModerators} selectedModeratorId={[]} onUpdate={onUpdate}/>);
		r.find("select").simulate("change", { target: { value: "2" }});
		expect(assignToModerator).toBeCalledWith(sampleAuditStoreId, "2");
		setTimeout(() => {
			expect(onUpdate).toBeCalledWith("FOO");
			done();
		});
	});


	it("calls revokeFromModerator when no moderator is selected", (done) => {
		const onUpdate = jest.fn();
		revokeFromModerator.mockResolvedValue("FOO");
		const r = shallow(<ModeratorAssignDropdown auditStoreId={sampleAuditStoreId} moderators={sampleModerators} selectedModeratorId={[]} onUpdate={onUpdate}/>);
		r.find("select").simulate("change", { target: { value: "" }});
		expect(revokeFromModerator).toBeCalledWith(sampleAuditStoreId);
		setTimeout(() => {
			expect(onUpdate).toBeCalledWith("FOO");
			done();
		});
	});
});
