import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';
import Datetime from 'react-datetime';

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
		return {
			submitting: false,
		};
	},
	setSubmitting: function(submitting){
		this.setState((prevState) => Object.assign({}, prevState, { submitting }));
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
		this.setSubmitting(true);
		let promise = this.props.dispatch(submitAuditApplyForm({
			audit_id: this.props.audit.id,
			audit_date: this.state.audit_date ? this.state.audit_date.format("YYYY-MM-DD") : "",
		})).done(() => hashHistory.push(`/audit/cycle/${this.props.audit.audit_cycle.id}`)).always(() => this.setSubmitting(false));
	},
	isValidDate: function(currentDate, selectedDate){
		let startDate = moment(this.props.audit.audit_cycle.start_date);
		let endDate = moment(this.props.audit.audit_cycle.end_date);
		return currentDate.isBetween(startDate, endDate, null, '[]'); //inclusive
	},
	render : function(){
		return (
			<Modal modalTitle={`Apply for Audit at ${this.props.audit.store.location.city.name}`} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p className="text-center">
						<big>{ moment(this.props.audit.audit_cycle.start_date).format(momentDateFormat) }</big> to <big>{ moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat) }</big>
					</p>
					<style dangerouslySetInnerHTML={{__html:".rdtPicker{ margin-left:auto; margin-right:auto; }"}}/>
					<Datetime style={{marginLeft:"auto",marginRight:"auto"}}
						timeFormat={false} dateFormat="YYYY-MM-DD"
						closeOnSelect={false} closeOnTab={false} disableOnClickOutside={true}
						open={true} input={false}
						name="audit_date"
						value={this.state.audit_date}
						onChange={this.dateChanged}
						isValidDate={this.isValidDate}
					/>
					<FormErrorList errors={this.props.errors.audit_date}/>
					<button className="btn btn-lg btn-primary btn-block" disabled={!this.state.audit_date || this.state.submitting}>
						{ this.state.submitting ? "applying..." :
						<span>Apply{ this.state.audit_date ? <span> for <b>{this.state.audit_date.format(momentDateFormat)}</b></span> : null }</span> }
					</button>
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
