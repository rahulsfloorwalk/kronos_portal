import React from "react";
import $ from "jquery";
import * as ReactRedux from "react-redux";
import { Link, hashHistory } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { loadAuditCancelForm, submitAuditCancelForm } from "../actions/application.js";


import { getAuditType, getAuditStatus } from "../../utils.js";
import { affectInputEventToComponent } from "../../react_utils.js";
import FormErrorList from "../../components/FormErrorList.jsx";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import FormGroup from "../../components/FormGroup.jsx";
import FormTextarea from "../../components/FormTextarea.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

class AuditCancelForm extends React.Component {
    state = {};

    componentDidMount() {
    	this.props.dispatch(loadAuditCancelForm(this.props.params.auditId));
    }

    fieldChanged = (e) => {
    	affectInputEventToComponent(e, this);
    };

    onSubmit = (e) => {
    	e.preventDefault();
    	var promise = this.props.dispatch(submitAuditCancelForm( this.props.audit.id));
    	promise.then(() => hashHistory.push(`/audit/cycle/${this.props.audit.audit_cycle.id}`));
    };

    render() {
    	return (
    		<Modal modalTitle="Cancel Audit" onClose={hashHistory.goBack}>
    			<form onSubmit={this.onSubmit}>
    				<FormErrorList errors={this.props.errors.non_field_errors}/>
    				<p><label>Audit Type:</label> { getAuditType(this.props.audit.audit_cycle.type) }</p>
    				<p><label>Start Date:</label> { moment(this.props.audit.audit_cycle.start_date).format(momentDateFormat) }</p>
    				<p><label>End Date:</label> { moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat) }</p>
    				<p><label>Audit Date:</label> { moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat) }</p>
    				<p><label>Address:</label> { this.props.audit.store.address }, { this.props.audit.store.city.name }</p>
    				<p>Are you sure you want to cancel your application for this audit?</p>
    				<div className="form-group">
    					<SaveButton text="Yes"/>&nbsp;&nbsp;
    					<button type="button" onClick={hashHistory.goBack} className="btn btn-default">No</button>
    				</div>
    			</form>
    		</Modal>
    	);
    }
}

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId],
		errors: store.forms.auditCancel.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditCancelForm);
