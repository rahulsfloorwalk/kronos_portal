import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { Link, hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { loadAuditCancelForm, submitAuditCancelForm } from '../../auditor/actions/application.js';


import { getAuditType, getAuditStatus } from '../../utils.js';
import { affectInputEventToComponent } from '../../react_utils.js';
import FormErrorList from '../FormErrorList.jsx';
import FormInput from '../FormInput.jsx';
import FormSelect from '../FormSelect.jsx';
import FormGroup from '../FormGroup.jsx';
import FormTextarea from '../FormTextarea.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';

var AuditCancelForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(loadAuditCancelForm(this.props.params.auditId));
	},
	fieldChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		var promise = this.props.dispatch(submitAuditCancelForm( this.props.audit.id));
		promise.then(() => hashHistory.push(`/audit/cycle/${this.props.audit.audit_cycle.id}`));
	},
	render : function(){
		return (
			<Modal modalTitle="Cancel Audit" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p><label>Audit Type:</label> { getAuditType(this.props.audit.audit_cycle.type) }</p>
					<p><label>Start Date:</label> { moment(this.props.audit.audit_cycle.start_date).format(momentDateFormat) }</p>
					<p><label>End Date:</label> { moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat) }</p>
					<p><label>Audit Date:</label> { moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat) }</p>
					<p><label>Location:</label> { this.props.audit.store.location.name }, { this.props.audit.store.location.city.name }</p>
					<p>Are you sure you want to cancel your application for this audit?</p>
					<div className="form-group">
						<SaveButton text="Yes"/>&nbsp;&nbsp;
						<button type="button" onClick={hashHistory.goBack} className="btn btn-default">No</button>
					</div>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId],
		errors: store.forms.auditCancel.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditCancelForm);
