import { findFormErrors } from "../forms";

describe(findFormErrors, () => {
	const sampleErrors = {
		"name": "This field is mandatory",
	};
	it("should return the form errors", () => {
		const sampleStore = {
			forms: {
				errors: sampleErrors,
			},
		};
		expect(findFormErrors(sampleStore)).toEqual(sampleErrors);
	});
	describe("when there are no errors", () => {
		const sampleStore = {
			forms: {
				errors: undefined,
			},
		};

		it("should return an empty object", () => {
			expect(findFormErrors(sampleStore)).toEqual({});
		});
	});
});
