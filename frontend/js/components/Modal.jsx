import React from "react";
import PropTypes from "prop-types";

const modalStyle = {
	display: "block",
	overflow: "scroll"
};
const modalBackdropStyle = {
	zIndex: "1060",
	height: "100%"
};
const modalDialogStyle = {
	zIndex: "1070",
};

export default class Modal extends React.Component {
	static propTypes = {
		onClose: PropTypes.func,
		size: PropTypes.oneOf(["modal-sm", "modal-lg", ""]),
		modalTitle: PropTypes.string,
		children: PropTypes.node,
	};

	static defaultProps = {
		size: "",
	};

	render() {
		return (
			<div className="modal" tabIndex="-1" style={modalStyle}>
				<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.props.onClose}/>
				<div className={`modal-dialog ${this.props.size}`} style={modalDialogStyle}>
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" onClick={this.props.onClose}>&times;</button>
							<h4 className="modal-title">{this.props.modalTitle}</h4>
						</div>
						<div className="modal-body">
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

