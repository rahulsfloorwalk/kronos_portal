import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { submitApplicationApproveForm } from '../../manager/actions/application.js';

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

var ApplicationApproveForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	contextTypes: {
		auditCycleId: React.PropTypes.number
	},
	componentDidMount: function(){
		if(this.props.application){
			this.setState({
				'audit_date': this.props.application.audit_date
			});
		}
	},
	componentWillReceiveProps: function(nextProps) {
		console.debug("nextProps.application",nextProps.application);
		if(nextProps.application && ! this.state.date_set ){
			this.setState({
				'audit_date': nextProps.application.audit_date,
				'date_set': true
			});
		};
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
		var promise = this.props.dispatch(submitApplicationApproveForm(obj));
		promise.then(() => hashHistory.push(`/audit_cycle/${this.context.auditCycleId}/audit`));
	},
	render : function(){
		if( ! this.props.application){
			return <Loading/>;
		}
		return (
			<Modal modalTitle="Approve Application" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p><label>Auditor Name:</label> { this.props.application.profileinfo.first_name } {this.props.application.profileinfo.last_name}</p>
					<FormDateInput label="Approved Audit Date" value={this.state.audit_date} name="audit_date" onChange={this.dateChanged} errors={this.props.errors.audit_date}/>
					<SaveButton text="Approve"/>
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

export default ReactRedux.connect( mapStoreToProps)(ApplicationApproveForm);
