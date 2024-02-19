import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import * as ReactRedux from "react-redux";

import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";
import FormInput from "../../components/FormInput.jsx";

import { affectInputEventToComponent } from "../../react_utils.js";

import {withdrawAuditStore, fetchAuditStore} from "../actions/audit_store.js";

import { auditStorePropType } from "../prop_types";

class WithdrawReport extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		auditStore: auditStorePropType,
	};

	constructor(props){
		super(props);
		this.state = {
			"message":""
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId)).then((auditStore)=>{
			if(auditStore.status === "FAILED" || auditStore.status === "SUBMITTED" || auditStore.status === "PM_REVIEW" || auditStore.status === "WITHDRAWN" || auditStore.status === "AUDITOR_WITHDRAWN" || auditStore.status === "COMPLETED" || auditStore.status === "ACCEPTED" || auditStore.status === "REJECTED"){
				hashHistory.push("audit_store");
			}
		});
	}

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(withdrawAuditStore(this.props.params.auditStoreId, this.state.message)).then(()=>{
			hashHistory.push("audit_store");
		});
	};

	closeModal = () => {
		hashHistory.push("audit_store");
	};

	render(){
		if(this.props.auditStore == null){
			return <Loading />;
		}
		return (
			<Modal modalTitle="Withdraw the Audit?" onClose={this.closeModal}>
				<form onSubmit={this.onSubmit}>
					{/* <p>Are you sure you want to <b>Withdraw</b> audit of <b>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b> - {this.props.auditStore.audit.store.name} ?</p> */}
					<p>Are you sure you want to <b>Withdrawn</b> the <b>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b> - {this.props.auditStore.audit.store.name} audit ?</p>
					<FormInput type="text" label="Reason:" value={this.state.message} name="message" placeholder="Please enter reason for audit withdraw" onChange={this.fieldChanged}/>
					<div className="form-group">
						<button type="submit" className="btn btn-primary">Yes</button>
						&nbsp;&nbsp;
						<button type="button" onClick={this.closeModal} className="btn btn-default">Cancel</button>
					</div>
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId] || null,
	};
};
export default ReactRedux.connect( mapStoreToProps)(WithdrawReport);