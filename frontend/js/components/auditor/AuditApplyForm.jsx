import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { loadAuditApplyForm, submitAuditApplyForm } from '../../auditor_actions.js';

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

var AuditApplyForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(loadAuditApplyForm(this.props.params.auditId));
	},
	componentWillReceiveProps: function(nextProps) {
		/*
		this.setState(nextProps.audit);
		if(nextProps.audit && nextProps.audit.client){
			this.setState({
				'client': nextProps.audit.client.id
			});
		}*/
	},
	fieldChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		var obj = {
			audit_id: this.props.audit.id,
			location_id: this.getAuditLocation().location.id,
			audit_location_id: this.props.auditLocationId,
			audit_date: this.state.audit_date
		};
		this.props.dispatch(submitAuditApplyForm(obj));
	},
	getAuditLocation: function(){
		var auditLocationId = parseInt(this.props.params.auditLocationId);
		for( var al of this.props.audit.auditlocations){
			if(al.id === auditLocationId){
				return al;
			}
		}
	},
	render : function(){
		var auditLocation = this.getAuditLocation();
		return (
			<Modal modalTitle="Apply for Audit" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p><label>Audit Type:</label> { getAuditType(this.props.audit.type) }</p>
					<p><label>Start Date:</label> { this.props.audit.start_date }</p>
					<p><label>End Date:</label> { this.props.audit.end_date }</p>
					<p><label>Location:</label> { auditLocation.location.name }, { auditLocation.location.city.name }</p>
					<FormInput label="Preferred Audit Date" type="date" value={this.state.audit_date} name="audit_date" onChange={this.fieldChanged} errors={this.props.errors.audit_date}/>
					<SaveButton text="Apply"/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId] || {},
		errors: store.forms.auditApply.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditApplyForm);
