import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";

export default class ConfirmDialog extends React.Component {
	static propTypes = {
		title: PropTypes.string,
		message: PropTypes.node,
		confirmText: PropTypes.string,
		cancelText: PropTypes.string,
		onConfirm: PropTypes.func,
		onCancel: PropTypes.func,
	};

	static defaultProps = {
		title: "Are you sure?",
		confirmText: "Yes",
		cancelText: "No",
	};

	render() {
		return (
			<Modal modalTitle={this.props.title} onClose={this.props.onCancel} size="modal-md">
				<p>{this.props.message}</p>
				<div style={{ textAlign: "right", marginTop: "1rem" }}>
					<button className="btn btn-default" onClick={this.props.onCancel} style={{ marginRight: "8px" }}>
						{this.props.cancelText}
					</button>
					<button className="btn btn-danger" onClick={this.props.onConfirm}>
						{this.props.confirmText}
					</button>
				</div>
			</Modal>
		);
	}
}