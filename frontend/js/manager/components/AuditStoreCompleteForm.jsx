import React, { Component } from "react";
import $ from "jquery";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { completeAuditStore } from "../actions/audit_store.js";

import { getAuditType, getAuditStatus } from "../../utils.js";
import { affectInputEventToComponent } from "../../react_utils.js";
import FormErrorList from "../../components/FormErrorList.jsx";
import { FormDateInput } from "../../components/FormInput.jsx";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import FormGroup from "../../components/FormGroup.jsx";
import FormTextarea from "../../components/FormTextarea.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

class AuditStoreCompleteForm extends Component{
	constructor(props){
		super(props);
		this.state = {
			errors: {},
		};
	}
	onSubmit = (e) => {
		e.preventDefault();
		let promise = this.props.dispatch(completeAuditStore(this.props.params.auditStoreId, this.state.rating));
		promise.then(()=>{
			hashHistory.goBack();
			Alert.success("REPORT COMPLETED");
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	};
	ratingSelected = (rating) => {
		this.setState({rating});
	};
	render(){
		if( ! this.props.auditStore){
			return (
				<Modal modalTitle="Complete Report" onClose={hashHistory.goBack}>
					<Loading/>
				</Modal>
			);
		}
		return ( <Modal modalTitle="Complete Report" onClose={hashHistory.goBack}>
			<form onSubmit={this.onSubmit}>
				<FormErrorList errors={this.state.errors.non_field_errors}/>
				<p><label>Auditor:</label> { this.props.auditStore.user.profileinfo.first_name } { this.props.auditStore.user.profileinfo.last_name }</p>
				<p><label>Report Date:</label> { moment(this.props.auditStore.audit_date).format(momentDateFormat) }</p>
				<div className="form-group">
					<label className="control-label">Report Quality Rating:</label>
					<div className="btn-group btn-group-justified">
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 0 ? "active" : "")} onClick={() => this.ratingSelected(0)}>Bad</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 1 ? "active" : "")} onClick={() => this.ratingSelected(1)}>Average</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 2 ? "active" : "")} onClick={() => this.ratingSelected(2)}>Good</button>
						</div>
					</div>
				</div>
				<button className="btn btn-lg btn-success">Complete Report</button>
			</form>
		</Modal>
		);
	}
}

let mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditStoreCompleteForm);
