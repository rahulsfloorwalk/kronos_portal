import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchPreferences, savePreferences } from '../../auditor/service/preferences.js';

import { affectInputEventToComponent } from '../../react_utils.js';

import FormErrorList from '../FormErrorList.jsx';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Modal.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			errors: {},
			preferences: null,
		};
	},
	setLoading: function(loading){
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	},
	componentDidMount: function() {
		this.setLoading(true);
		fetchPreferences().done((preferences) => {
			this.setState({preferences});
		}).always(() => this.setLoading(false));
	},
	inputChanged: function(e){
		this.setState({
			preferences: Object.assign({}, this.state.preferences, {
				[e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
			})
		});
	},
	onSubmit: function(e){
		e.preventDefault();
		savePreferences(this.state.preferences).done(() => {
			hashHistory.goBack();
		}).fail((err)=>{
			this.setState({errors: err.responseJSON || {}});
		});
	},
	render : function(){
		return (
			<Modal modalTitle="Edit Bank Info" onClose={hashHistory.goBack}>
				{ ! this.state.loading && this.state.preferences ?
					<form onSubmit={this.onSubmit}>
						<FormErrorList errors={this.state.errors.non_field_errors}/>
						<FormInput type="checkbox"
							label="Receive email about new opportunities?"
							checked={this.state.preferences.receive_new_opportunities_email}
							name="receive_new_opportunities_email" onChange={this.inputChanged}
							errors={this.state.errors.receive_new_opportunities_email}
						/>
						<SaveButton/>
					</form>
				: <Loading/> }
			</Modal>
		);
	},
});

