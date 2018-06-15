import React from "react";
import PropTypes from "prop-types";
import Header from "../Header.jsx";
import renderer from "react-test-renderer";

class RouterContextProvider extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	static childContextTypes = {
		router: PropTypes.object,
	};

	getChildContext = () => ({
		router: {
			isActive: jest.fn(),
			push: jest.fn(),
			replace: jest.fn(),
			go: jest.fn(),
			goBack: jest.fn(),
			goForward: jest.fn(),
			setRouteLeaveHook: jest.fn(),
			createHref: jest.fn(),
		},
	});

	render() {
		return this.props.children;
	}
}

describe("<Header/>", () => {
	it("is rendered correctly", () => {
		const r = renderer.create(<RouterContextProvider><Header/></RouterContextProvider>);
		expect(r.toJSON()).toMatchSnapshot();
	});
});
