import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { loadAuditAddForm, loadAuditEditForm, saveAuditEditForm, saveAuditAddForm, fetchAuditCycle } from '../../manager/actions/audit.js';
import {fetchStores} from '../../manager/actions/store.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import StoreSelector from '../StoreSelector.jsx';
import FormErrorList from '../FormErrorList.jsx';

var AuditForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		console.log("componentDidMount(...) called with props.params as", this.props.params);
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId)).then( auditCycle => {
			this.props.dispatch(fetchStores(auditCycle.client.id));
		});
		if(this.props.params.auditId){
			this.props.dispatch(loadAuditEditForm(this.props.params.auditId));
		} else {
			this.props.dispatch(loadAuditAddForm());
		}
		this.setState({
			audit_cycle: this.props.params.auditCycleId
		});
	},
	componentWillReceiveProps: function(nextProps) {
		console.log("componentWillReceiveProps(...) called with",nextProps);
		if( nextProps.audit){
			this.setState(nextProps.audit);
		}
		this.setState({
			audit_cycle: nextProps.params.auditCycleId
		});
		if(nextProps.auditCycle){
			this.setState({
				earnings_per_audit: nextProps.auditCycle.earnings_per_audit,
				reimbursement: nextProps.auditCycle.reimbursement,
			});
		}
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		var submitPromise;
		console.log(this.state);
		if(this.props.params.auditId){
			submitPromise = this.props.dispatch(saveAuditEditForm(this.state));
		} else {
			submitPromise = this.props.dispatch(saveAuditAddForm(this.state));
		}
		submitPromise.then( savedClient => hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`));
	},
	render : function(){
		var modalTitle = this.props.params.auditId ? "Edit Audit" : "Add Audit";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<StoreSelector value={this.state.store} onChange={this.inputChanged} errors={this.props.errors.store}/>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Audit Fees (₹)" type="number" value={this.state.earnings_per_audit} name="earnings_per_audit" onChange={this.inputChanged} errors={this.props.errors.earnings_per_audit}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Reimbursement upto (₹)" type="number" value={this.state.reimbursement} name="reimbursement" onChange={this.inputChanged} errors={this.props.errors.reimbursement}/>
						</div>
					</div>
					<FormInput label="Number of Audits" type="number" value={this.state.count} name="count" onChange={this.inputChanged} errors={this.props.errors.count}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
  console.log(ownProps);
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
		audit: store.audits[ownProps.params.auditId],
		errors: store.forms.audit.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditForm);
