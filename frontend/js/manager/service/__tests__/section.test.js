import $ from "jquery";
import { updateSection, addSection, deleteSection } from "../section";

jest.mock("jquery", () => ({
	ajax: jest.fn(),
}));

const sampleSection = {
	id: 1,
	name: "Hello World",
	audit_cycle: 4,
	sequence: 2,
	minimum_attachment_count: 3,
};

describe(updateSection, () => {
	it("calls the url to update the section", () => {
		updateSection(sampleSection);
		expect($.ajax).toBeCalledWith({
			type: "POST",
			url: "/manager/section/1",
			contentType: "application/json",
			data: JSON.stringify(sampleSection),
		});
	});
});

describe(addSection, () => {
	it("calls the url to add a new section", () => {
		addSection(sampleSection);
		expect($.ajax).toBeCalledWith({
			type: "POST",
			url: "/manager/section",
			contentType: "application/json",
			data: JSON.stringify(sampleSection),
		});
	});
});

describe(deleteSection, () => {
	it("calls the url to add a new section", () => {
		deleteSection(sampleSection.id);
		expect($.ajax).toBeCalledWith({
			type: "DELETE",
			url: "/manager/section/1",
		});
	});
});
