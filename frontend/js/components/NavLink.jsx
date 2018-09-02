import React from "react";
import PropTypes from "prop-types";

import { Link } from "react-router";

export default class NavLink extends React.Component {
	static propTypes = {
		to: PropTypes.string,
		children: PropTypes.node,
	};

	static contextTypes = {
		router: PropTypes.shape({
			isActive: PropTypes.func.isRequired,
		})
	};

	render() {
		const className = this.context.router.isActive(this.props.to, true) ? "active" : "";

		return (
			<li className={className} role="presentation">
				<Link {...this.props}>
					{this.props.children}
				</Link>
			</li>
		);
	}
}
