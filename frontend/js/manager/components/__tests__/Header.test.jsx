import React from "react";
import Header from "../Header.jsx";
import renderer from "react-test-renderer";
import { RouterContextProvider } from "../../../test_utils.js";

describe("<Header/>", () => {
	it("is rendered correctly", () => {
		const r = renderer.create(<RouterContextProvider><Header/></RouterContextProvider>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
