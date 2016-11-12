import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchBankInfo, saveBankInfo } from '../../auditor_actions.js';

import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

var BankInfoForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentWillMount: function() {
		this.setState(this.props.bankInfo);
	},
	componentDidMount: function() {
		this.props.dispatch(fetchBankInfo());
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.bankInfo);
	},
	inputChanged: function(e){
		var change = {};
		change[e.target.name] = e.target.value;
		this.setState(change);
	},
	onSubmit: function(e){
		e.preventDefault();
		this.props.dispatch(saveBankInfo(this.state));
	},
	render : function(){
		return (
			<Modal modalTitle="Edit Bank Info" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Bank Name" maxLength="40" type="text" value={this.state.bank_name} name="bank_name" onChange={this.inputChanged} errors={this.props.errors.bank_name}/>
					<FormInput label="Account Holder Name" maxLength="40" type="text" value={this.state.account_holder_name} name="account_holder_name" onChange={this.inputChanged} errors={this.props.errors.account_holder_name}/>
					<FormInput label="Account Number" maxLength="20" type="text" value={this.state.account_number} name="account_number" onChange={this.inputChanged} errors={this.props.errors.account_number}/>
					<FormInput label="IFSC Code" maxLength="20" type="text" value={this.state.ifsc_code} name="ifsc_code" onChange={this.inputChanged} errors={this.props.errors.ifsc_code}/>
					<FormInput label="Pan Number" maxLength="10" type="text" value={this.state.pan_number} name="pan_number" onChange={this.inputChanged} errors={this.props.errors.pan_number}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		bankInfo: store.bankInfo,
		errors: store.forms.bankInfo.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(BankInfoForm);
