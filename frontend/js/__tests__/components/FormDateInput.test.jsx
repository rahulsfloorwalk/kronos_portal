import React from "react";
import { FormDateInput } from "../../components/FormInput.jsx";
import renderer from "react-test-renderer";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

let dateNowSpy;

beforeAll(() => {
	// Lock Time
	dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => 1524910191000);
});

describe("<FormDateInput/>", () => {
	const basicProps = {
		label: "Date of Birth",
	};

	it("renders a date input with a label", () => {
		const tree = renderer
			.create(<FormDateInput {...basicProps}/>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

afterAll(() => {
	// Unlock Time
	dateNowSpy.mockReset();
	dateNowSpy.mockRestore();
});
