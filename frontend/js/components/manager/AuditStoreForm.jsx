import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { loadAuditStoreAddForm, loadAuditStoreEditForm, saveSectionEditForm, saveAuditStoreAddForm } from '../../manager/actions/audit_store.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

var AuditStoreForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		console.log("componentDidMount(...) called with props.params as", this.props.params);
		if(this.props.params.auditStoreId){
			this.props.dispatch(loadaAuditStoreEditForm(this.props.params.auditStoreId));
		} else {
			this.props.dispatch(loadAuditStoreAddForm());
		}
		this.setState({
			audit_cycle: this.props.params.auditCycleId
		});
	},
	componentWillReceiveProps: function(nextProps) {
		console.log("componentWillReceiveProps(...) called with",nextProps);
		if( nextProps.auditStore){
			this.setState(nextProps.auditStore);
		}
		this.setState({
			audit_cycle: nextProps.params.auditCycleId
		});
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		var submitPromise;
		console.log(this.state);
		if(this.props.params.auditStoreId){
			submitPromise = this.props.dispatch(saveAuditStoreEditForm(this.state));
		} else {
			submitPromise = this.props.dispatch(saveAuditStoreAddForm(this.state));
		}
		submitPromise.then( savedClient => hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}`));
	},
	render : function(){
		var modalTitle = this.props.params.auditCycleId ? "Edit Audit Store" : "Add Audit Store";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
  console.log(ownProps);
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
		errors: store.forms.auditStore.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditStoreForm);
