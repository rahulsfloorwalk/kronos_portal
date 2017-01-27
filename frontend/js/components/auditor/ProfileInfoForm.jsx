import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchProfileInfo, saveProfileInfo, fetchStates, fetchCities } from '../../auditor_actions.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import { FormDateInput } from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
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
			cityOptions.push(<option key={c} value={this.props.cities[c].id}>{this.props.cities[c].name}</option>);
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

var ProfileInfoForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.setState(this.props.profileInfo);
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchStates());
		if( this.props.profileInfo.state){
			this.props.dispatch(fetchCities(this.props.profileInfo.state));
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.profileInfo);
		if( nextProps.profileInfo.city){
			this.setState({
				'city':nextProps.profileInfo.city.id
			});
		}
		if( nextProps.state){
			this.props.dispatch(fetchCities(nextProps.state));
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
	dateChanged: function(date){
		if( typeof date !== "string"){
			this.setState({
				date_of_birth: date.format("YYYY-MM-DD")
			});
		}
	},
	onSubmit: function(e){
		e.preventDefault();
		this.props.dispatch(saveProfileInfo(this.state));
	},
	render : function(){
		return (
			<Modal modalTitle="Edit Personal Information" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="First Name" maxLength="20" type="text" value={this.state.first_name} name="first_name" onChange={this.inputChanged} errors={this.props.errors.first_name}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Last Name" maxLength="20" type="text" value={this.state.last_name} name="last_name" onChange={this.inputChanged} errors={this.props.errors.last_name}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormDateInput label="Date of Birth" value={this.state.date_of_birth} name="date_of_birth" onChange={this.dateChanged} errors={this.props.errors.date_of_birth}/>
						</div>
						<div className="col-md-6">
							<FormSelect label="Gender" name="gender" value={this.state.gender} onChange={this.inputChanged}>
								<option value=""></option>
								<option value="M">Male</option>
								<option value="F">Female</option>
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormSelect label="Marital Status" name="marital_status" value={this.state.marital_status} onChange={this.inputChanged} errors={this.props.errors.marital_status}>
								<option value=""></option>
								<option value="S">Single</option>
								<option value="M">Married</option>
								<option value="D">Divorced</option>
								<option value="W">Widowed</option>
							</FormSelect>
						</div>
						<div className="col-md-6">
							<FormSelect label="Education" name="education" value={this.state.education} onChange={this.inputChanged} errors={this.props.errors.education}>
								<option value=""></option>
								<option value="TE">10th (Middle School)</option>
								<option value="TW">12th (High School)</option>
								<option value="CO">In College</option>
								<option value="GR">Graduate</option>
								<option value="PG">Post Graduate and Above</option>
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Address" maxLength="100" type="text" value={this.state.address} name="address" onChange={this.inputChanged} errors={this.props.errors.address}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Pincode" maxLength="8" type="text" value={this.state.pincode} name="pincode" onChange={this.inputChanged} errors={this.props.errors.pincode}/>
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
					<FormInput label="Mobile Number" maxLength="10" type="text" value={this.state.mobile_number} name="mobile_number" onChange={this.inputChanged} errors={this.props.errors.mobile_number}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		errors: store.forms.profileInfo.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(ProfileInfoForm);
