import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { loadAuditCancelForm, submitAuditCancelForm } from '../../auditor_actions.js';

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
		this.props.dispatch(submitAuditCancelForm( this.props.audit.id, this.getAuditLocation().location.id));
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
			<Modal modalTitle="Cancel Audit" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p><label>Audit Type:</label> { getAuditType(this.props.audit.type) }</p>
					<p><label>Start Date:</label> { this.props.audit.start_date }</p>
					<p><label>End Date:</label> { this.props.audit.end_date }</p>
					<p><label>Location:</label> { auditLocation.location.name }, { auditLocation.location.city.name }</p>
					<SaveButton text="Cancel"/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId] || {},
		errors: store.forms.auditCancel.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditCancelForm);
