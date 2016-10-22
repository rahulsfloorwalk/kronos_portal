import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { loadClientAddForm, loadClientEditForm, saveClientEditForm, saveClientAddForm } from '../../manager_actions.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

var ClientForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		if(this.props.params.clientId){
			this.props.dispatch(loadClientEditForm(this.props.params.clientId));
		} else {
			this.props.dispatch(loadClientAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.client);
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		if(this.props.params.clientId){
			this.props.dispatch(saveClientEditForm(this.state));
		} else {
			this.props.dispatch(saveClientAddForm(this.state));
		}
	},
	render : function(){
		var modalTitle = this.props.params.clientId ? "Edit Client" : "Add Client";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Client Name" maxLength="50" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name}/>
					<FormInput label="Email Address" maxLength="50" type="text" value={this.state.email} name="email" onChange={this.inputChanged} errors={this.props.errors.email}/>
					<FormInput label="Phone Number" maxLength="15" type="text" value={this.state.phone} name="phone" onChange={this.inputChanged} errors={this.props.errors.phone}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		client: store.clients[ownProps.params.clientId] || {},
		errors: store.forms.client.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(ClientForm);
