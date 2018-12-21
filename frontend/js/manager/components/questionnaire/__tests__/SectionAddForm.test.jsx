import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import { SectionAddForm } from "../SectionAddForm.jsx";

describe(SectionAddForm, () => {
	let router;
	let loadSectionAddForm;
	let saveSectionAddForm;
	let location;
	beforeEach(() => {
		router = {
			push: jest.fn(),
			goBack: jest.fn(),
		};
		location = {
			pathname: "/foo/bar",
		};

		loadSectionAddForm = jest.fn();
		saveSectionAddForm = jest.fn();
	});

	it("calls the loadSectionAddForm prop", () => {
		shallow(<SectionAddForm
			auditCycleId={5}

			location={location}
			router={router}

			errors={{}}

			loadSectionAddForm={loadSectionAddForm}
			saveSectionAddForm={saveSectionAddForm}
		/>);

		expect(loadSectionAddForm).toBeCalled();
	});

	it("renders an empty form", () => {
		const r = renderer.create(<SectionAddForm
			auditCycleId={5}

			location={location}
			router={router}

			errors={{}}

			loadSectionAddForm={loadSectionAddForm}
			saveSectionAddForm={saveSectionAddForm}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	describe("form submission", () => {
		let r;
		let formEvent;
		const auditCycleId = 5;

		const sequence = 1;
		const name = "Kalimba de Luna";
		const minimumAttachmentCount = 1;

		beforeEach(() => {
			r = shallow(<SectionAddForm
				auditCycleId={auditCycleId}

				location={location}
				router={router}

				errors={{}}

				loadSectionAddForm={loadSectionAddForm}
				saveSectionAddForm={saveSectionAddForm}
			/>);
			r.find("FormInput").at(0).simulate("change", { target: { name: "sequence", value: sequence}});
			r.find("FormInput").at(1).simulate("change", { target: { name: "name", value: name}});
			r.find("FormInput").at(2).simulate("change", { target: { name: "minimum_attachment_count", value: minimumAttachmentCount}});

			saveSectionAddForm.mockResolvedValue({
				id: 1,
				sequence: 1,
				name: "",
				minimum_attachment_count: 0,
				audit_cycle: auditCycleId,
			});

			formEvent = {
				preventDefault: jest.fn(),
			};
		});

		describe("the form is submitted normally", () => {
			beforeEach(() => {
				r.find("form").simulate("submit", formEvent);
			});
			it("calls the saveSectionAddForm prop with the form values", () => {
				expect(saveSectionAddForm).toBeCalledWith({
					sequence: sequence,
					name: name,
					minimum_attachment_count: minimumAttachmentCount,
					audit_cycle: auditCycleId,
				});
			});

			it("calls preventDefault on the form event", () => {
				expect(formEvent.preventDefault).toBeCalled();
			});

			it("navigates to the questionnaire", (done) => {
				setTimeout(() => {
					expect(router.push).toBeCalledWith("/audit_cycle/5/questionnaire");
					done();
				});
			});
		});

		describe("the save and next button is clicked", () => {
			beforeEach(() => {
				r.find("button").simulate("click");
			});
			it("calls the saveSectionAddForm prop with the form values", () => {
				expect(saveSectionAddForm).toBeCalledWith({
					sequence: sequence,
					name: name,
					minimum_attachment_count: minimumAttachmentCount,
					audit_cycle: auditCycleId,
				});
			});

			it("increments the sequence and clears the form", (done) => {
				setTimeout(() => {
					r.update();
					expect(r.find("FormInput").at(0).prop("value")).toEqual(sequence + 1);
					expect(r.find("FormInput").at(1).prop("value")).toEqual("");
					done();
				});
			});

			it("navigates to the current route", (done) => {
				setTimeout(() => {
					expect(router.push).toBeCalledWith(location.pathname);
					done();
				});
			});
		});
	});
});
