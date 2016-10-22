import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchClients, loadAuditAddForm, loadAuditEditForm, saveAuditAddForm, saveAuditEditForm } from '../../manager_actions.js';

import { getAuditType, getAuditStatus } from '../../utils.js';
import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormSelect from '../FormSelect.jsx';
import FormGroup from '../FormGroup.jsx';
import FormTextarea from '../FormTextarea.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';

var AuditForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(fetchClients());
		if(this.props.params.auditId){
			this.props.dispatch(loadAuditEditForm(this.props.params.auditId));
		} else {
			this.props.dispatch(loadAuditAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.audit);
		if(nextProps.audit && nextProps.audit.client){
			this.setState({
				'client': nextProps.audit.client.id
			});
		}
	},
	fieldChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		if(this.props.params.auditId){
			this.props.dispatch(saveAuditEditForm(this.state));
		} else {
			this.props.dispatch(saveAuditAddForm(this.state));
		}
	},
	render : function(){
		var clientRows = [];
		for( var id in this.props.clients){
			clientRows.push(<option value={id} key={id}>{this.props.clients[id].name}</option>);
		}
		var modalTitle = this.props.params.auditId ? "Edit Client" : "Add Client";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormSelect label="Client" name="client" value={this.state.client} onChange={this.fieldChanged} errors={this.props.errors.client}>
						<option value=""></option>
						{clientRows}
					</FormSelect>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Start Date" type="date" value={this.state.start_date} name="start_date" onChange={this.fieldChanged} errors={this.props.errors.start_date}/>
						</div>
						<div className="col-md-6">
							<FormInput label="End Date" type="date" value={this.state.end_date} name="end_date" onChange={this.fieldChanged} errors={this.props.errors.end_date}/>
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
					<FormTextarea label="Description" name="description" value={this.state.description} onChange={this.fieldChanged} errors={this.props.errors.description}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId] || {},
		clients: store.clients,
		errors: store.forms.audit.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditForm);
