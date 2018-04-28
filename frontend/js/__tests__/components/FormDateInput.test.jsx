import React from "react";
import { FormDateInput } from "../../components/FormInput.jsx";
import renderer from "react-test-renderer";

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

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
