import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import {  loadAuditCycleAddForm, loadAuditCycleEditForm, saveAuditCycleAddForm, saveAuditCycleEditForm } from '../../manager/actions/audit.js';

import { getAuditType, getAuditStatus } from '../../utils.js';
import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import { FormDateInput } from '../FormInput.jsx';
import FormSelect from '../FormSelect.jsx';
import FormGroup from '../FormGroup.jsx';
import FormTextarea from '../FormTextarea.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';

var AuditCycleForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		if(this.props.params.auditCycleId){
			this.props.dispatch(loadAuditCycleEditForm(this.props.params.auditCycleId));
		} else {
			this.props.dispatch(loadAuditCycleAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.auditCycle);
		if(nextProps.auditCycle && nextProps.auditCycle.client){
			this.setState({
				'client': nextProps.auditCycle.client.id
			});
		} else {
			this.setState({
				'client': nextProps.params.clientId
			});
		}
	},
	fieldChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	dateChanged: function(name, date){
		if( typeof date !== "string"){
			this.setState({
				[name]: date.format("YYYY-MM-DD")
			});
		}
	},
	startDateChanged: function(date){
		this.dateChanged("start_date",date);
	},
	endDateChanged: function(date){
		this.dateChanged("end_date",date);
	},
	onSubmit: function(e){
		e.preventDefault();
		var promise;
		if(this.props.params.auditCycleId){
			promise = this.props.dispatch(saveAuditCycleEditForm(this.state));
		} else {
			promise = this.props.dispatch(saveAuditCycleAddForm(this.state));
		}
		promise.then(function(savedAuditCycle){
			hashHistory.push(`/audit_cycle/${savedAuditCycle.id}`);
		});
	},
	render : function(){
		var clientRows = [];
		var modalTitle = this.props.params.auditId ? "Edit Audit Cycle" : "Add Audit Cycle";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-md-6">
							<FormDateInput label="Start Date" value={this.state.start_date} name="start_date" onChange={this.startDateChanged} errors={this.props.errors.start_date}/>
						</div>
						<div className="col-md-6">
							<FormDateInput label="End Date" value={this.state.end_date} name="end_date" onChange={this.endDateChanged} errors={this.props.errors.end_date}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormSelect label="Audit Type" name="type" value={this.state.type} onChange={this.fieldChanged} errors={this.props.errors.type}>
								<option value=""></option>
								<option value="1">{getAuditType("1")}</option>
								<option value="2">{getAuditType("2")}</option>
								<option value="3">{getAuditType("3")}</option>
								<option value="4">{getAuditType("4")}</option>
								<option value="5">{getAuditType("5")}</option>
							</FormSelect>
						</div>
						<div className="col-md-6">
							<FormSelect label="Audit Status" name="status" value={this.state.status} onChange={this.fieldChanged} errors={this.props.errors.status}>
								<option value=""></option>
								<option value="1">{getAuditStatus("1")}</option>
								<option value="2">{getAuditStatus("2")}</option>
								<option value="3">{getAuditStatus("3")}</option>
							</FormSelect>
						</div>
					</div>
					<FormInput label="Earnings Per Audit (₹)" type="number" value={this.state.earnings_per_audit} name="earnings_per_audit" onChange={this.fieldChanged} errors={this.props.errors.earnings_per_audit}/>
					<FormTextarea label="Description" name="description" value={this.state.description} onChange={this.fieldChanged} errors={this.props.errors.description}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId] || {},
		errors: store.forms.auditCycle.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditCycleForm);
