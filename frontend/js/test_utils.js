import React from "react";
import PropTypes from "prop-types";

export class RouterContextProvider extends React.Component {
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
