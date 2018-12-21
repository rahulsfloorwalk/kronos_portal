import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

import { SectionEditForm } from "../SectionEditForm.jsx";

const sampleSection = {
	id: 1,
	audit_cycle: 2,
	name: "Coco Jumbo",
	sequence: 1,
	max_marks: 1,
	minimum_attachment_count: 1,
};

describe(SectionEditForm, () => {
	let router;
	let loadSectionEditForm;
	let saveSectionEditForm;
	let location;
	beforeEach(() => {
		router = {
			push: jest.fn(),
			goBack: jest.fn(),
		};
		location = {
			pathname: "/foo/bar",
		};

		loadSectionEditForm = jest.fn();
		saveSectionEditForm = jest.fn();
	});

	it("calls the loadSectionEditForm prop", () => {
		shallow(<SectionEditForm
			auditCycleId={sampleSection.audit_cycle}
			sectionId={sampleSection.id}

			location={location}
			router={router}

			errors={{}}
			section={sampleSection}

			loadSectionEditForm={loadSectionEditForm}
			saveSectionEditForm={saveSectionEditForm}
		/>);

		expect(loadSectionEditForm).toBeCalledWith(sampleSection.id);
	});

	it("renders a pre-filled form", () => {
		const r = renderer.create(<SectionEditForm
			auditCycleId={sampleSection.audit_cycle}
			sectionId={sampleSection.id}

			location={location}
			router={router}

			errors={{}}
			section={sampleSection}

			loadSectionEditForm={loadSectionEditForm}
			saveSectionEditForm={saveSectionEditForm}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	describe("when the form is submitted", () => {
		let r;
		let formEvent;
		const auditCycleId = sampleSection.audit_cycle;

		beforeEach(() => {
			r = shallow(<SectionEditForm
				auditCycleId={auditCycleId}
				sectionId={sampleSection.id}

				location={location}
				router={router}

				errors={{}}
				section={sampleSection}

				loadSectionEditForm={loadSectionEditForm}
				saveSectionEditForm={saveSectionEditForm}
			/>);

			saveSectionEditForm.mockResolvedValue(sampleSection);

			formEvent = {
				preventDefault: jest.fn(),
			};

			r.find("form").simulate("submit", formEvent);
		});

		it("calls the saveSectionEditForm prop with the form values", () => {
			expect(saveSectionEditForm).toBeCalledWith(sampleSection);
		});

		it("calls preventDefault on the form event", () => {
			expect(formEvent.preventDefault).toBeCalled();
		});

		it("navigates to the questionnaire", (done) => {
			setTimeout(() => {
				expect(router.push).toBeCalledWith("/audit_cycle/2/questionnaire");
				done();
			});
		});
	});
});
