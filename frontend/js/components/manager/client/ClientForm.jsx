import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { fetchClient, addClient, updateClient } from '../../../manager/service/client.js';

import { getInputEventChangeValue } from '../../../react_utils.js';
import FormInput from '../../FormInput.jsx';
import FormGroup from '../../FormGroup.jsx';
import SaveButton from '../../SaveButton.jsx';
import Modal from '../../Modal.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			client: null,
			errors: {},
			form: {},
		};
	},
	componentDidMount: function() {
		if(this.props.params.clientId){
			fetchClient(this.props.params.clientId).done((client)=>{
				this.setState({
					client,
					form: {
						name: client.name,
						email: client.email,
						phone: client.phone,
						logo_url: client.logo_url,
					},
				});
			});
		}
	},
	inputChanged: function(e){
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e)),
		});
	},
	onSubmit: function(e){
		e.preventDefault();
		let submitPromise;
		if(this.props.params.clientId){
			submitPromise = updateClient({
				id: this.props.params.clientId,
				name: this.state.form.name,
				email: this.state.form.email,
				phone: this.state.form.phone,
				logo_url: this.state.form.logo_url,
			});
		} else {
			submitPromise = addClient({
				name: this.state.form.name,
				email: this.state.form.email,
				phone: this.state.form.phone,
				logo_url: this.state.form.logo_url,
			});
		}
		submitPromise.done(function(savedClient){
			hashHistory.push(`/client/${savedClient.id}/audit_cycle`);
			Alert.success("CLIENT SAVED");
		}).fail((err)=>{
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	},
	render : function(){
		var modalTitle = this.props.params.clientId ? "Edit Client" : "Add Client";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Client Name" maxLength="50" type="text" value={this.state.form.name} name="name" onChange={this.inputChanged} errors={this.state.errors.name}/>
					<FormInput label="Email Address" maxLength="50" type="email" value={this.state.form.email} name="email" onChange={this.inputChanged} errors={this.state.errors.email}/>
					<FormInput label="Phone Number" maxLength="15" type="text" value={this.state.form.phone} name="phone" onChange={this.inputChanged} errors={this.state.errors.phone}/>
					<FormInput label="Logo URL" maxLength="512" type="text" value={this.state.form.logo_url} name="logo_url" onChange={this.inputChanged} errors={this.state.errors.logo_url}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});
