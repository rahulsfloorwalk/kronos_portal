import React from "react";
import renderer from "react-test-renderer";

import PrintToPDFButton from "../PrintToPDFButton.jsx";

describe(PrintToPDFButton, () => {
	let r;
	let sectionCount;
	describe("when sectionCount is > 5", () => {
		beforeEach(() => {
			sectionCount = 6;
			r = renderer.create(<PrintToPDFButton sectionCount={sectionCount} />);
		});
		it("renders nothing", () => {
			expect(r.toJSON()).toMatchSnapshot();
		});
	});
	describe("when sectionCount is <= 5", () => {
		beforeEach(() => {
			sectionCount = 3;
			r = renderer.create(<PrintToPDFButton sectionCount={sectionCount} />);
		});
		it("renders the button", () => {
			expect(r.toJSON()).toMatchSnapshot();
		});
	});
});
