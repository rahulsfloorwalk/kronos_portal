
import rootReducer from "../../reducers.js";

import types from "../../action_types";

import { resetFormErrors, setFormErrors } from "../forms";


describe("form reducer", () => {
	describe(types.RESET_FORM_ERRORS, () => {
		it("sets the form errors to undefined", () => {
			const nextState = rootReducer({}, resetFormErrors());

			expect(nextState.forms.errors).toEqual(undefined);
		});
	});

	describe(types.SET_FORM_ERRORS, () => {
		const sampleFormErrors = {
			name: ["This field is mandatory"],
		};
		it("sets the form errors", () => {
			const nextState = rootReducer({}, setFormErrors(sampleFormErrors));
			expect(nextState.forms.errors).toEqual(sampleFormErrors);
		});
	});
});

describe(resetFormErrors, () => {
	it("returns an action to reset the form errors", () => {
		expect(resetFormErrors()).toEqual({
			type: types.RESET_FORM_ERRORS,
		});
	});
});

describe(setFormErrors, () => {
	const sampleFormErrors = {
		name: ["This field is mandatory"],
	};
	it("returns an action to set the form errors", () => {
		expect(setFormErrors(sampleFormErrors)).toEqual({
			type: types.SET_FORM_ERRORS,
			errors: sampleFormErrors,
		});
	});
});
