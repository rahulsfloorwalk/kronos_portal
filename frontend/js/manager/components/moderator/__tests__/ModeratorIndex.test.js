import React from "react";
import renderer from "react-test-renderer";
import { createRouterContextProvider } from "../../../../test_utils.js";

import ModeratorIndex from "../ModeratorIndex.jsx";

describe(ModeratorIndex, () => {
	it("renders the children with the tabs", () => {
		const isActive = jest.fn(() => false);
		const ContextProvider = createRouterContextProvider({ isActive });
		const r = renderer.create(<ContextProvider>
			<ModeratorIndex>
				<p>Sample Child</p>
			</ModeratorIndex>
		</ContextProvider>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
