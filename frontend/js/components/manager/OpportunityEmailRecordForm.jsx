import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { fetchStates, fetchCities } from '../../manager/service/location.js';
import { saveOpportunityEmailRecord } from '../../manager/service/opportunity_email.js';

import { getInputEventChangeValue } from '../../react_utils.js';
import FormSelect from '../FormSelect.jsx';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import FormErrorList from '../FormErrorList.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';

import { __StateSelector } from '../StateSelector.jsx';
import { __CitySelector } from '../CitySelector.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			errors: {},
			form: {},
			cities: [],
			states: {},
		};
	},
	componentDidMount: function() {
		fetchStates().done((states)=>this.setState({states}));
	},
	inputChanged: function(e){
		let change = getInputEventChangeValue(e);
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				form: Object.assign({}, prevState.form, change),
			});
		});
	},
	stateChanged: function(e){
		this.inputChanged(e);
		fetchCities(e.target.value).done((cities)=>this.setState({cities}));
	},
	onSubmit: function(e){
		e.preventDefault();
		let promise = saveOpportunityEmailRecord(this.props.params.auditCycleId, this.state.form.city).done((opp) => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/opportunity_email`);
			Alert.success(`${opp.total_count} EMAILS SCHEDULED`);
		}).fail((err) => {
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	},
	render : function(){
		if( ! (this.state.states)){
			return <Loading/>;
		}

		return (
			<Modal modalTitle="Schedule Opportunity Email" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<div className="row">
						<div className="col-sm-6">
							<__StateSelector states={this.state.states} value={this.state.form.state} onChange={this.stateChanged}/>
						</div>
						<div className="col-sm-6">
							<__CitySelector cities={this.state.cities} value={this.state.form.city} onChange={this.inputChanged}/>
						</div>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});
