import React from "react";
import renderer from "react-test-renderer";

import { createRouterContextProvider } from "../../test_utils.js";
import NavLink from "../NavLink.jsx";

describe("<NavLink/>", () => {
	it("renders content within an inactive nav link", () => {
		const isActive = jest.fn(() => false);
		const ContextProvider = createRouterContextProvider({ isActive });
		const r = renderer.create(<ContextProvider>
			<NavLink to="/foo/bar">View</NavLink>
		</ContextProvider>);
		expect(r.toJSON()).toMatchSnapshot();
	});
	it("renders content within an active nav link", () => {
		const isActive = jest.fn(() => true);
		const ContextProvider = createRouterContextProvider({ isActive });
		const r = renderer.create(<ContextProvider>
			<NavLink to="/foo/bar">View</NavLink>
		</ContextProvider>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
