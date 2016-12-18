import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchStates, fetchCities, fetchLocations } from '../../manager_actions.js';
import { fetchLocationsByCity, loadAuditLocationAddForm, loadAuditLocationEditForm, saveAuditLocationAddForm, saveAuditLocationEditForm } from '../../manager/actions/audit.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import FormErrorList from '../FormErrorList.jsx';
import FormSelect from '../FormSelect.jsx';
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

/* Location Selector Starts */

var __LocationSelector = React.createClass({
	render : function(){
		let locationOptions = [];
		for( let l in this.props.locations){
			locationOptions.push(<option key={l} value={l}>{this.props.locations[l].name}</option>);
		}
		return (
			<FormSelect label="Location" name="location" {...this.props}>
				<option value=""></option>
				{locationOptions}
			</FormSelect>
		);
	}
});

var mapStoreToPropsForLocationSelector = function(store){
	return {
		locations: store.locations,
	};
};

var LocationSelector = ReactRedux.connect(mapStoreToPropsForLocationSelector)(__LocationSelector);

/* Location Selector Ends */


var AuditLocationForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(fetchStates());
		//this.props.dispatch(fetchCities());
		//this.props.dispatch(fetchLocations());

		if(this.props.params.auditLocationId){
			this.props.dispatch(loadAuditLocationEditForm(this.props.params.auditLocationId));
		} else {
			this.props.dispatch(loadAuditLocationAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		console.log("nextProps",nextProps);
		this.setState(nextProps.auditLocation);
		if(nextProps.auditLocation && nextProps.auditLocation.location){
			this.setState({
				'location': nextProps.auditLocation.location.id,
				'city': nextProps.auditLocation.location.city.id,
				'state': nextProps.auditLocation.location.city.state
			});
			this.props.dispatch(fetchCities(nextProps.auditLocation.location.city.state));
			this.props.dispatch(fetchLocations(nextProps.auditLocation.location.city.id));
		}
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	myStateChanged: function(e){
		this.inputChanged(e);
		var stateCode = e.target.value;
		console.debug("statecode",stateCode);
		if( stateCode){
			this.props.dispatch(fetchCities(e.target.value));
		}
	},
	myCityChanged: function(e){
		this.inputChanged(e);
		var cityId = e.target.value;
		console.debug("cityId",cityId);
		if( cityId){
			this.props.dispatch(fetchLocations(cityId));
		}
	},
	onSubmit: function(e){
		e.preventDefault();
		if(this.props.params.auditLocationId){
			this.props.dispatch(saveAuditLocationEditForm({
				id: this.props.params.auditLocationId,
				count: this.state.count,
				location: this.state.location,
				audit: this.props.params.auditId
			}));
		} else {
			this.props.dispatch(saveAuditLocationAddForm({
				count: this.state.count,
				location: this.state.location,
				audit: this.props.params.auditId
			}));
		}
	},
	render : function(){
		/*
		var cityRows = [];
		for( var id in this.props.cities){
			cityRows.push(<option value={id} key={id}>{this.props.cities[id].name}</option>);
		}

		var locationRows = [];
		if( this.state.city){
			for( var id in this.props.locations){
				if(this.props.locations[id].city.id === parseInt(this.state.city)){
					locationRows.push(<option value={id} key={id}>{this.props.locations[id].name}</option>);
				}
			}
		}
							<FormSelect label="Location" name="location" value={this.state.location} onChange={this.inputChanged} errors={this.props.errors.location}>
								<option value=""></option>
								{locationRows}
							</FormSelect>
		*/

		var modalTitle = this.props.params.auditLocationId ? "Edit Audit Location" : "Add Audit Location";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<div className="row">
						<div className="col-sm-6">
							<StateSelector value={this.state.state} onChange={this.myStateChanged}/>
						</div>
						<div className="col-sm-6">
							<CitySelector value={this.state.city} onChange={this.myCityChanged}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<LocationSelector value={this.state.location} onChange={this.inputChanged}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Count" type="number" value={this.state.count} name="count" onChange={this.inputChanged} errors={this.props.errors.count}/>
						</div>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	console.log("ownProps.auditLocationId",ownProps.params.auditLocationId);
	var auditLocation = store.audits[ownProps.params.auditId].auditlocations.filter((al) => al.id === parseInt(ownProps.params.auditLocationId))[0];
	console.debug("found al:",auditLocation);
	return {
		auditLocation: auditLocation || {},
		errors: store.forms.auditLocation.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditLocationForm);
