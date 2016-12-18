import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { submitApplicationCompleteForm } from '../../manager/actions/application.js';

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

var ApplicationCompleteForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	fieldChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		var promise = this.props.dispatch(submitApplicationCompleteForm(this.props.application.id));
		promise.done(() => hashHistory.push(`/audit/${this.props.params.auditId}`));
	},
	render : function(){
		return (
			<Modal modalTitle="Complete Audit Application" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p><label>Auditor Name:</label> { this.props.application.profileinfo.first_name } {this.props.application.profileinfo.last_name}</p>
					<p>Are you sure you want to complete this application?</p>
					<SaveButton text="Complete"/>
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

export default ReactRedux.connect( mapStoreToProps)(ApplicationCompleteForm);
