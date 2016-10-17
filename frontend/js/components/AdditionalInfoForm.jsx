import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import url from '../../config.js';
import { fetchAdditionalInfo, saveAdditionalInfo } from '../actions.js';

import FormInput from './FormInput.jsx';
import FormGroup from './FormGroup.jsx';
import SaveButton from './SaveButton.jsx';
import Modal from './Modal.jsx';

var AdditionalInfoForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentWillMount: function() {
		this.setState(this.props.additionalInfo);
	},
	componentDidMount: function() {
		this.props.dispatch(fetchAdditionalInfo());
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.additionalInfo);
	},
	inputChanged: function(e){
		var change = {};
		if( e.target.type !== "checkbox"){
			change[e.target.name] = e.target.value;
		} else if(e.target.type === "checkbox"){
			change[e.target.name] = e.target.checked;
		}
		this.setState(change);
	},
	onSubmit: function(e){
		e.preventDefault();
		this.props.dispatch(saveAdditionalInfo(this.state));
	},
	render : function(){
		return (
			<Modal modalTitle="Edit Additional Info" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Has Car" maxLength="40" type="checkbox" checked={this.state.has_car} name="has_car" onChange={this.inputChanged} errors={this.props.errors.has_car}/>
					<FormInput label="Weekend Audit" maxLength="40" type="checkbox" checked={this.state.weekend_audit} name="weekend_audit" onChange={this.inputChanged} errors={this.props.errors.weekend_audit}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		additionalInfo: store.additionalInfo,
		errors: store.forms.additionalInfo.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AdditionalInfoForm);
