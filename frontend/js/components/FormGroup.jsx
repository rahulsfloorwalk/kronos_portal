import React from "react";
import PropTypes from "prop-types";

export default class FormGroup extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	render() {
		return (
			<div className="form-group">
				{this.props.children}
			</div>
		);
	}
}

