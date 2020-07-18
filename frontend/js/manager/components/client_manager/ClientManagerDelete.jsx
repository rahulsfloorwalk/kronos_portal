import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Modal from "../../../components/Modal.jsx";

export default class ClientManagerDelete extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
			clientUserId: PropTypes.string.isRequired,
		})
	};

	render(){
		var modalTitle = "Delete Manager";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<p>
					<label>Are you sure you want to remove manager from client?</label>
				</p>
				<button className="btn btn-primary" onClick={this.deleteManager}>Yes</button>
				&nbsp;&nbsp;&nbsp;
				<button className="btn btn-primary" onClick={hashHistory.goBack}>No</button>
			</Modal>
		);
	}
}
