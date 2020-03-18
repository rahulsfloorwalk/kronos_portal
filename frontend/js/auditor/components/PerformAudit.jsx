import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import * as ReactRedux from "react-redux";

import Modal from "../../components/Modal.jsx";
import {failAuditStore, fetchAuditStore} from "../actions/audit_store.js";

import { auditStorePropType } from "../prop_types";

class PerformAudit extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		auditStore: auditStorePropType,
	};

	constructor(props){
		super(props);
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
		if(this.props.auditStore.status === "FAILED" || this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW" || this.props.auditStore.status === "WITHDRAWN" || this.props.auditStore.status === "COMPLETED" || this.props.auditStore.status === "ACCEPTED" || this.props.auditStore.status === "REJECTED"){
			hashHistory.push(`audit_store/${this.props.params.auditStoreId}/section/`);
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(failAuditStore(this.props.params.auditStoreId));
		location.reload();
	};

	closeModal = () => {
		hashHistory.push(`audit_store/${this.props.params.auditStoreId}/section/`);
	};

	render(){
		return (
			<Modal modalTitle="Performed the Audit?" onClose={this.closeModal}>
				<form onSubmit={this.onSubmit}>
					<p>If you did not perform the Audit please click <b>No</b> Button and if you did please click <b>Yes</b> Button and Fill the Report within a 48 hours.</p>
					<br/>
					<div className="form-group">
						<button type="button" onClick={this.closeModal} className="btn btn-primary">Yes</button>&nbsp;&nbsp;
						<button type="submit" className="btn btn-danger">No</button>
					</div>
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
	};
};
export default ReactRedux.connect( mapStoreToProps)(PerformAudit);