import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { submitApplicationRejectForm } from '../../manager/actions/application.js';
import { findById } from '../../manager/service/application.js';

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

var ApplicationRejectForm = React.createClass({
	getInitialState: function(){
		return {
			application: null,
			errors: {},
		};
	},
	contextTypes: {
		auditCycleId: React.PropTypes.number
	},
	componentDidMount: function(){
		findById(this.props.params.applicationId).then(application => {
			this.setState({
				application,
			});
		});
	},
	fieldChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		var promise = this.props.dispatch(submitApplicationRejectForm(this.props.params.applicationId));
		promise.then(() => {
			hashHistory.push({
				pathname: `/audit_cycle/${this.context.auditCycleId}/audit`,
				state: { t: Date.now() },
			});
			Alert.success("APPLICATION DENIED");
		});
	},
	render : function(){
		if( ! this.state.application){
			return <Loading/>;
		}
		return (
			<Modal modalTitle="Deny Application" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p><label>Auditor Name:</label> { this.state.application.profileinfo.first_name } {this.state.application.profileinfo.last_name}</p>
					<p>Are you sure you want to reject this application?</p>
					<SaveButton text="Deny"/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	var application;
	try{
		application = store.audits[ownProps.params.auditId].applications.filter(function(app){
			return app.id === Number(ownProps.params.applicationId);
		})[0];
	}catch(e){
		console.debug("looks like we're still loading the application...",e);
	}
	return {
		application,
		errors: store.errors,
	};
};

export default ReactRedux.connect()(ApplicationRejectForm);
