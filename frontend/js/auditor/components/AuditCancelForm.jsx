import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { loadAuditCancelForm, submitAuditCancelForm } from "../actions/application.js";


import { getAuditType } from "../../utils.js";
import { affectInputEventToComponent } from "../../react_utils.js";
import FormErrorList from "../../components/FormErrorList.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";

import { auditPropType } from "../prop_types";

class AuditCancelForm extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		audit: auditPropType,
		params: PropTypes.shape({
			auditId: PropTypes.string.isRequired,
		}),
		errors: PropTypes.shape({
			non_field_errors: PropTypes.arrayOf(PropTypes.string),
		}),
	};

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
		if(!this.props.audit){
			return null;
		}
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
