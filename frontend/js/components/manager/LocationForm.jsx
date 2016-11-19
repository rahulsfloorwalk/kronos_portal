import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchStates, fetchCities, loadLocationAddForm, loadLocationEditForm, saveLocationEditForm, saveLocationAddForm } from '../../manager_actions.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormSelect from '../FormSelect.jsx';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

/* State Selector begins */

var __StateSelector = React.createClass({
	render : function(){
		let stateOptions = [];
		for( let s in this.props.states){
			stateOptions.push(<option key={s} value={s}>{this.props.states[s]}</option>);
		}
		return (
			<FormSelect label="State" name="state" {...this.props}>
				<option value=""></option>
				{stateOptions}
			</FormSelect>
		);
	}
});

var mapStoreToPropsForStateSelector = function(store){
	return {
		states: store.states,
	};
};

var StateSelector = ReactRedux.connect(mapStoreToPropsForStateSelector)(__StateSelector);

/* State Selector Ends */

/* City Selector Starts */

var __CitySelector = React.createClass({
	render : function(){
		let cityOptions = [];
		for( let c in this.props.cities){
			cityOptions.push(<option key={c} value={c}>{this.props.cities[c].name}</option>);
		}
		return (
			<FormSelect label="City" name="city" {...this.props}>
				<option value=""></option>
				{cityOptions}
			</FormSelect>
		);
	}
});

var mapStoreToPropsForCitySelector = function(store){
	return {
		cities: store.cities,
	};
};

var CitySelector = ReactRedux.connect(mapStoreToPropsForCitySelector)(__CitySelector);

/* City Selector Ends */


var LocationForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(fetchCities());
		this.props.dispatch(fetchStates());
		if(this.props.params.locationId){
			this.props.dispatch(loadLocationEditForm(this.props.params.locationId));
		} else {
			this.props.dispatch(loadLocationAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.location);
		if(nextProps.location && nextProps.location.city){
			this.setState({
				'city': nextProps.location.city.id,
				'state': nextProps.location.city.state
			});
			this.props.dispatch(fetchCities(nextProps.location.city.state));
		}
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	myStateChanged: function(e){
		this.inputChanged(e);
		var stateCode = e.target.value;
		if( stateCode){
			this.props.dispatch(fetchCities(e.target.value));
		}
	},
	onSubmit: function(e){
		e.preventDefault();
		if(this.props.params.locationId){
			this.props.dispatch(saveLocationEditForm(this.state));
		} else {
			this.props.dispatch(saveLocationAddForm(this.state));
		}
	},
	render : function(){
		var modalTitle = this.props.params.locationId ? "Edit Location" : "Add Location";

		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Name" maxLength="100" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Pincode" maxLength="6" type="text" value={this.state.pincode} name="pincode" onChange={this.inputChanged} errors={this.props.errors.pincode}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<StateSelector value={this.state.state} onChange={this.myStateChanged}/>
						</div>
						<div className="col-md-6">
							<CitySelector value={this.state.city} onChange={this.inputChanged}/>
						</div>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store,ownProps){
	return {
		location: store.locations[ownProps.params.locationId] || {},
		errors: store.forms.location.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(LocationForm);
