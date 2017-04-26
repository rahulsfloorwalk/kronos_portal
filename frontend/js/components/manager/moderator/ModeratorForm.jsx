import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { findById, insert, update } from '../../../manager/service/moderator.js';

import { getInputEventChangeValue } from '../../../react_utils.js';
import FormInput from '../../FormInput.jsx';
import FormGroup from '../../FormGroup.jsx';
import SaveButton from '../../SaveButton.jsx';
import Modal from '../../Modal.jsx';
import Loading from '../../Loading.jsx';
import FormErrorList from '../../FormErrorList.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			moderator: {
				email: "",
				password: "",
				is_active: true
			},
			errors: {
			}
		};
	},
	setLoading: function(loadingState){
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loading: loadingState
			});
		});
	},
	componentDidMount: function() {
		if(this.props.params.userId){
			this.setLoading(true);
			findById(this.props.params.userId).then( (moderator) => {
				this.setState({
					moderator: Object.assign({}, moderator, {
						password: ""
					})
				});
			}).always(() => this.setLoading(false));
		}
	},
	fieldChanged: function(e){
		this.setState({
			moderator: Object.assign({}, this.state.moderator, getInputEventChangeValue(e))
		});
	},
	onSubmit: function(e){
		e.preventDefault();
		var promise;
		if(this.props.params.userId){
			promise = update(
				this.props.params.userId, 
				this.state.moderator.email,
				this.state.moderator.password,
				this.state.moderator.is_active);
		} else {
			promise = insert(
				this.state.moderator.email,
				this.state.moderator.password,
				this.state.moderator.is_active);
		}
		promise.then(function(savedModerator){
			hashHistory.push("/moderator");
		}, (errors) => {
			if (errors.responseJSON){
				this.setState({
					errors: errors.responseJSON
				});
			}
		});
	},
	render : function(){
		if(this.state.loading){
			return (<Loading/>);
		}
		var modalTitle = this.props.params.userId ? "Edit Moderator" : "Add Moderator";
		let passwordPlaceholder = this.props.params.userId ? "leave blank to keep password unchanged" : "";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormInput label="Email Address" type="email" value={this.state.moderator.email} name="email" onChange={this.fieldChanged} errors={this.state.errors.email}/>
					<FormInput label="Password" type="text" value={this.state.moderator.password} name="password" onChange={this.fieldChanged} errors={this.state.errors.password} placeholder={passwordPlaceholder}/>
					<FormInput label="Active?" type="checkbox" checked={this.state.moderator.is_active} name="is_active" onChange={this.fieldChanged} errors={this.state.errors.is_active}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});
