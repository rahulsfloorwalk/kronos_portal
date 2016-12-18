import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { submitApplicationAssignForm } from '../../manager/actions/application.js';

import { getAuditType, getAuditStatus } from '../../utils.js';
import { affectInputEventToComponent } from '../../react_utils.js';
import FormErrorList from '../FormErrorList.jsx';
import { FormDateInput } from '../FormInput.jsx';
import FormInput from '../FormInput.jsx';
import FormSelect from '../FormSelect.jsx';
import FormGroup from '../FormGroup.jsx';
import FormTextarea from '../FormTextarea.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';

var ApplicationAssignForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function(){
		this.setState({
			'audit_date': this.props.application.audit_date
		});
	},
	componentWillReceiveProps: function(nextProps) {
		console.debug(nextProps.application);
		this.setState({
			'audit_date': nextProps.application.audit_date
		});
	},
	dateChanged: function(date){
		if( typeof date !== "string"){
			this.setState({
				audit_date: date.format("YYYY-MM-DD")
			});
		}
	},
	onSubmit: function(e){
		e.preventDefault();
		var obj = {
			application_id: this.props.application.id,
			audit_date: this.state.audit_date
		};
		var promise = this.props.dispatch(submitApplicationAssignForm(obj));
		promise.done(() => hashHistory.push(`/audit/${this.props.params.auditId}`));
	},
	render : function(){
		return (
			<Modal modalTitle="Assign Audit" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p><label>Auditor Name:</label> { this.props.application.profileinfo.first_name } {this.props.application.profileinfo.last_name}</p>
					<FormDateInput label="Assigned Audit Date" value={this.state.audit_date} name="audit_date" onChange={this.dateChanged} errors={this.props.errors.audit_date}/>
					<SaveButton text="Assign"/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		application: store.applications[ownProps.params.applicationId] || {},
		errors: store.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(ApplicationAssignForm);
