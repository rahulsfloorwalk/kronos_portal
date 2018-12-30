import React from "react";
import PropTypes from "prop-types";

export default class Badge extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	render() {
		return (
			<span className="badge">{this.props.children}</span>
		);
	}
}
