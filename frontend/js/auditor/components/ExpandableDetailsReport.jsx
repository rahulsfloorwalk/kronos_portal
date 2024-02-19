import React from "react";
import PropTypes from "prop-types";
// import { pointerStyle } from "../../styles.js";
import { FetchGuidlineByAuditStore } from "../actions/audit_store.js";
import Modal from "../../components/Modal.jsx";

export default class ExpandableDetailsReport extends React.Component {
	static propTypes = {
		details: PropTypes.node,
		auditStoreId: PropTypes.string,
	};

	state = {
		expanded: false,
		guideline:"",
	};
	openPDFInNewTab = () => {
		const { guideline } = this.state;
		window.open(guideline, "_blank");
		this.setState({expanded:false});
	};
	buttonClicked = () => {
		FetchGuidlineByAuditStore(this.props.auditStoreId).then((guideline)=> this.setState({guideline:guideline}));
		this.setState({
			expanded: ! this.state.expanded
		});
	};
	buttonClose = () => {
		this.setState({
			expanded: false

		});
	};

	render() {
		// const buttonText = this.state.expanded ? "Hide Guidelines" : "View Guidelines";
		const details = this.state.expanded ?
			this.state.guideline ?
				this.openPDFInNewTab()
				:
				(<Modal size="modal-lg" modalTitle="Details" onClose={this.buttonClose}>

					<div>
						{this.props.details}
					</div>
				</Modal>)
			: null;
		return (
			<span>
				{/* <a style={pointerStyle} onClick={this.buttonClicked}>{buttonText}</a> */}
				{details}
			</span>
		);
	}
}