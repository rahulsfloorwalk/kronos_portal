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

export const createRouterContextProvider = (mocks) => {
	return class RouterContextProvider extends React.Component {
		static propTypes = {
			children: PropTypes.node,
		};

		static childContextTypes = {
			router: PropTypes.object,
		};

		getChildContext = () => ({
			router: {
				isActive: mocks.isActive || jest.fn(),
				push: mocks.push || jest.fn(),
				replace: mocks.replace || jest.fn(),
				go: mocks.go || jest.fn(),
				goBack: mocks.goBack || jest.fn(),
				goForward: mocks.goForward || jest.fn(),
				setRouteLeaveHook: mocks.setRouteLeaveHook || jest.fn(),
				createHref: mocks.createHref || jest.fn(),
			},
		});

		render() {
			return this.props.children;
		}
	};
};
