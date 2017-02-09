import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import {  loadClientUserAddForm, loadClientUserEditForm, saveClientUserAddForm, saveClientUserEditForm } from '../../../manager/actions/client_user.js';

import { getAuditType, getAuditStatus } from '../../../utils.js';
import { affectInputEventToComponent } from '../../../react_utils.js';
import FormInput from '../../FormInput.jsx';
import { FormDateInput } from '../../FormInput.jsx';
import FormSelect from '../../FormSelect.jsx';
import FormGroup from '../../FormGroup.jsx';
import FormTextarea from '../../FormTextarea.jsx';
import SaveButton from '../../SaveButton.jsx';
import Modal from '../../Modal.jsx';
import Loading from '../../Loading.jsx';
import FormErrorList from '../../FormErrorList.jsx';

var ClientUserForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.setState({
			'client': this.props.params.clientId
		});
		if(this.props.params.clientUserId){
			this.props.dispatch(loadClientUserEditForm(this.props.params.clientUserId));
		} else {
			this.props.dispatch(loadClientUserAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		if(nextProps.clientUser && nextProps.clientUser.user){
			this.setState({
				id : nextProps.clientUser.id,
				client: nextProps.clientUser.client,
				full_name : nextProps.clientUser.full_name,
				email : nextProps.clientUser.user.email,
				is_active : nextProps.clientUser.user.is_active,
				password : ""
			});
		} else {
			this.setState({
				client: nextProps.params.clientId,
				full_name: "",
				email: "",
				password: "",
				is_active: true
			});
		}
	},
	fieldChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		var promise;
		if(this.props.params.clientUserId){
			promise = this.props.dispatch(saveClientUserEditForm(this.state));
		} else {
			promise = this.props.dispatch(saveClientUserAddForm(this.state));
		}
		promise.then(function(savedClientUser){
			hashHistory.push(`/client/${savedClientUser.client}/client_user`);
		});
	},
	render : function(){
		var modalTitle = this.props.params.auditId ? "Edit Client User" : "Add Client User";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<FormInput label="Full Name" type="text" value={this.state.full_name} name="full_name" onChange={this.fieldChanged} errors={this.props.errors.full_name}/>
					<FormInput label="Email Address" type="email" value={this.state.email} name="email" onChange={this.fieldChanged} errors={this.props.errors.email}/>
					<FormInput label="Password" type="text" value={this.state.password} name="password" onChange={this.fieldChanged} errors={this.props.errors.password} placeholder="leave blank to keep password unchanged"/>
					<FormInput label="Active?" type="checkbox" checked={this.state.is_active} name="is_active" onChange={this.fieldChanged} errors={this.props.errors.is_active}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		clientUser: store.clientUsers[ownProps.params.clientUserId] || {},
		errors: store.forms.clientUser.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(ClientUserForm);
