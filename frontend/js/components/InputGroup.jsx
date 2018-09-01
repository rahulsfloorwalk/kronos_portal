import React from "react";
import PropTypes from "prop-types";

export default class InputGroup extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	render() {
		return (
			<div className="input-group">
				{this.props.children}
			</div>
		);
	}
}

export class InputGroupBtn extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	render() {
		return (
			<span className="input-group-btn">
				{this.props.children}
			</span>
		);
	}
}

