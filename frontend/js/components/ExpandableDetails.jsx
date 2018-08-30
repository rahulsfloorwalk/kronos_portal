import React from "react";
import PropTypes from "prop-types";
import { pointerStyle } from "../styles.js";

import Modal from "./Modal.jsx";

export default class ExpandableDetails extends React.Component {
	static propTypes = {
		details: PropTypes.node,
	};

	state = {
		expanded: false
	};

	buttonClicked = () => {
		this.setState({
			expanded: ! this.state.expanded
		});
	};

	render() {
		const buttonText = this.state.expanded ? "Hide Details" : "View Details";
		const details = this.state.expanded ?
			(<Modal size="modal-lg" modalTitle="Details" onClose={this.buttonClicked}>
				<div>
					{this.props.details}
				</div>
			</Modal>)
			: null;
		return (
			<span>
				<a style={pointerStyle} onClick={this.buttonClicked}>{buttonText}</a>
				{details}
			</span>
		);
	}
}
