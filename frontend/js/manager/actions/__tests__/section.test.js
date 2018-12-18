import thunkMiddleware from "redux-thunk";
import configureMockStore from "redux-mock-store";

import {
	fetchSections,
	fetchSection,
	loadSectionAddForm,
	loadSectionEditForm,
	saveSectionAddForm,
	saveSectionEditForm,
} from "../section";
import types from "../../action_types";
import * as service from "../../service/section";

jest.mock("../../service/section");
const mockStore = configureMockStore([thunkMiddleware]);

const sampleSections = [
	{
		id: 5,
		name: "Billiards Section",
		audit_cycle: 6,
	},
	{
		id: 6,
		name: "Tralfamador",
		audit_cycle: 6,
	}
];

describe("manager section actions", () => {
	let store;
	beforeEach(() => {
		store = mockStore({});
	});

	describe(fetchSection, () => {
		beforeEach(() => {
			service.fetchSectionById.mockResolvedValue(sampleSections[0]);
		});
		it("calls the service with the given sectionId", () => {
			return store.dispatch(fetchSection(5)).then(() => {
				expect(store.getActions()).toContainEqual({
					type: types.SECTION_ID_GET,
					status: "success",
					section: sampleSections[0],
				});
			});
		});
	});

	describe(fetchSections, () => {
		beforeEach(() => {
			service.fetchSectionsByAuditCycleId.mockResolvedValue(sampleSections);
		});
		it("calls the service with the given auditCycleId", () => {
			return store.dispatch(fetchSections(6)).then(() => {
				expect(store.getActions()).toContainEqual({
					type: types.SECTION_GET,
					status: "success",
					sections: sampleSections,
				});
			});
		});
	});

	describe(loadSectionAddForm, () => {
		it("dispatches an action to reset the form errors", () => {
			store.dispatch(loadSectionAddForm());
			expect(store.getActions()).toContainEqual({
				type: types.RESET_FORM_ERRORS,
			});
		});
	});

	describe(loadSectionEditForm, () => {
		beforeEach(() => {
			service.fetchSectionById.mockResolvedValue(sampleSections[0]);
		});
		it("dispatches an action to reset the form errors", () => {
			return store.dispatch(loadSectionEditForm(6)).then(() => {
				expect(store.getActions()).toContainEqual({
					type: types.RESET_FORM_ERRORS,
				});
			});
		});

		it("dispatches an action to fetch the section", () => {
			return store.dispatch(loadSectionEditForm(6)).then(() => {
				expect(store.getActions()).toContainEqual({
					type: types.SECTION_ID_GET,
					status: "success",
					section: sampleSections[0],
				});
			});
		});
	});

	describe(saveSectionEditForm, () => {
		const sampleSectionData = {
			id: 1,
			name: "Clark Kent",
			max_marks: 5,
			audit_cycle: 3,
		};

		beforeEach(() => {
			service.updateSection.mockResolvedValue(sampleSections[0]);
		});

		it("dispatches an action to reset the form errors", () => {
			store.dispatch(saveSectionEditForm(sampleSectionData));
			expect(store.getActions()).toContainEqual({
				type: types.RESET_FORM_ERRORS,
			});
		});

		it("calls the service with the section data", () => {
			return store.dispatch(saveSectionEditForm(sampleSectionData)).then(() => {
				expect(service.updateSection).toBeCalledWith(sampleSectionData);
			});
		});

		describe("when the save succeeds", () => {
			it("returns a promise resolved to the saved section", () => {
				return store.dispatch(saveSectionEditForm(sampleSectionData)).then((savedSection) => {
					expect(savedSection).toEqual(sampleSections[0]);
				});
			});

			it("dispatches an action to update the saved section", () => {
				return store.dispatch(saveSectionEditForm(sampleSectionData)).then(() => {
					expect(store.getActions()).toContainEqual({
						type: types.SECTION_ID_GET,
						status: "success",
						section: sampleSections[0],
					});
				});
			});
		});

		describe("when the save fails", () => {
			const sampleErrors = {
				name: ["This field is required"],
				max_marks: ["This must be a valid integer."],
			};
			beforeEach(() => {
				service.updateSection.mockRejectedValue({
					responseJSON: sampleErrors,
				});
			});

			it("returns a promise rejected with the errors", () => {
				return store.dispatch(saveSectionEditForm(sampleSectionData)).catch((error) => {
					expect(error.responseJSON).toEqual(sampleErrors);
				});
			});

			it("dispatches an action to set the form errors", () => {
				return store.dispatch(saveSectionEditForm(sampleSectionData)).catch(() => {
					expect(store.getActions()).toContainEqual({
						type: types.SET_FORM_ERRORS,
						errors: sampleErrors,
					});
				});
			});
		});
	});

	describe(saveSectionAddForm, () => {
		const sampleSectionData = {
			name: "Clark Kent",
			max_marks: 5,
			audit_cycle: 3,
		};

		beforeEach(() => {
			service.addSection.mockResolvedValue(sampleSections[0]);
		});

		it("dispatches an action to reset the form errors", () => {
			store.dispatch(saveSectionAddForm(sampleSectionData));
			expect(store.getActions()).toContainEqual({
				type: types.RESET_FORM_ERRORS,
			});
		});

		it("calls the service with the section data", () => {
			store.dispatch(saveSectionAddForm(sampleSectionData));
			expect(service.addSection).toBeCalledWith(sampleSectionData);
		});

		describe("when the save succeeds", () => {
			it("returns a promise resolved to the saved section", () => {
				return store.dispatch(saveSectionAddForm(sampleSectionData)).then((savedSection) => {
					expect(savedSection).toEqual(sampleSections[0]);
				});
			});

			it("dispatches an action to update the saved section", () => {
				return store.dispatch(saveSectionAddForm(sampleSectionData)).then(() => {
					expect(store.getActions()).toContainEqual({
						type: types.SECTION_ID_GET,
						status: "success",
						section: sampleSections[0],
					});
				});
			});
		});

		describe("when the save fails", () => {
			const sampleErrors = {
				name: ["This field is required"],
				max_marks: ["This must be a valid integer."],
			};
			beforeEach(() => {
				service.addSection.mockRejectedValue({
					responseJSON: sampleErrors,
				});
			});

			it("returns a promise rejected with the errors", () => {
				return store.dispatch(saveSectionAddForm(sampleSectionData)).catch((error) => {
					expect(error.responseJSON).toEqual(sampleErrors);
				});
			});

			it("dispatches an action to set the form errors", () => {
				return store.dispatch(saveSectionAddForm(sampleSectionData)).catch(() => {
					expect(store.getActions()).toContainEqual({
						type: types.SET_FORM_ERRORS,
						errors: sampleErrors,
					});
				});
			});
		});
	});
});
