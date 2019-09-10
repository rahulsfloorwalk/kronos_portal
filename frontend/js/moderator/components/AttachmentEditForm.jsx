import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import Modal from "../../components/Modal.jsx";

export default class ModeratorReportList extends React.Component {

	render() {
		var modalTitle = "Attachment Edit";
		var modalSize = "modal-lg"
		
		return (
			<Modal modalTitle={modalTitle} size={modalSize} onClose={hashHistory.goBack}>
				<h1>Modal body</h1>
			</Modal>
		);
	}
}