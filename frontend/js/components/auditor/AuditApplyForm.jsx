import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import moment from 'moment';

import { momentDateFormat }  from '../../../config.js';

import { loadAuditApplyForm, submitAuditApplyForm } from '../../auditor/actions/application.js';

import { getAuditType, getAuditStatus } from '../../utils.js';
import { affectInputEventToComponent } from '../../react_utils.js';

import FormErrorList from '../FormErrorList.jsx';
import { FormDateInput } from '../FormInput.jsx';
import FormSelect from '../FormSelect.jsx';
import FormGroup from '../FormGroup.jsx';
import FormTextarea from '../FormTextarea.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';

var AuditApplyForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(loadAuditApplyForm(this.props.params.auditId));
	},
	dateChanged: function(date){
		if( typeof date !== "string"){
			this.setState({
				audit_date: date
			});
		}
	},
	onSubmit: function(e){
		e.preventDefault();
		var obj = {
			audit_id: this.props.audit.id,
			audit_location_id: this.props.auditLocationId,
			audit_date: this.state.audit_date ? this.state.audit_date.format("YYYY-MM-DD") : ""
		};
		var promise = this.props.dispatch(submitAuditApplyForm(obj));
		promise.then(() => hashHistory.push(`/audit`));
	},
	render : function(){
		return (
			<Modal modalTitle="Apply for Audit" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p><label>Audit Type:</label> { getAuditType(this.props.audit.audit_cycle.type) }</p>
					<p><label>Start Date:</label> { moment(this.props.audit.audit_cycle.start_date).format(momentDateFormat) }</p>
					<p><label>End Date:</label> { moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat) }</p>
					<p><label>Location:</label> { this.props.audit.store.location.name }, { this.props.audit.store.location.city.name }</p>
					<FormDateInput label="Preferred Audit Date" value={this.state.audit_date} name="audit_date" onChange={this.dateChanged} errors={this.props.errors.audit_date}/>
					<SaveButton text="Apply"/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId],
		errors: store.forms.auditApply.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditApplyForm);
