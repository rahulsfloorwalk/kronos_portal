import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchStates, fetchCities } from '../../auditor/actions/location_info.js';
import { fetchProfileInfo, saveProfileInfo } from '../../auditor/actions/profile_info.js'

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import { FormDateInput } from '../FormInput.jsx';
import { Save } from '../Icons.jsx';
import FormGroup from '../FormGroup.jsx';
import FormSelect from '../FormSelect.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import DOBPicker from '../DOBPicker.jsx';
import Loading from '../Loading.jsx';

/* State Selector begins */

var __StateSelector = React.createClass({
	render : function(){
		let stateOptions = [];
		for( let s in this.props.states){
			stateOptions.push(<option key={s} value={s}>{this.props.states[s]}</option>);
		}
		return (
			<FormSelect label="State (✳)" name="state" {...this.props}>
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
	getDefaultProps: function(){
		return {
			state: null,
		};
	},
	render : function(){
		let cityOptions = [];
		for( let c of this.props.cities){
			if( c.state === this.props.state){
				cityOptions.push(<option key={c.id} value={c.id}>{c.name}</option>);
			}
		}
		return (
			<FormSelect label="City (✳)" name="city_id" {...this.props}>
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
		return {
			profileInfo: {},
			loading: false,
			submitting: false,
			errors: {},
		};
	},
	setLoading: function(loading){
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	},
	setSubmitting: function(submitting){
		this.setState((prevState) => Object.assign({}, prevState, { submitting }));
	},
	componentDidMount: function() {
		this.setLoading(true);
		Promise.all([
			this.props.dispatch(fetchProfileInfo()),
			this.props.dispatch(fetchStates()),
		]).then(([profileInfo, states] )=> {
			this.setLoading(false);
			this.setState(profileInfo);
			if(profileInfo.city){
				this.setState({
					state: profileInfo.city.state,
				});
				this.props.dispatch(fetchCities(profileInfo.city.state));
			}
		});
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	myStateChanged: function(e){
		this.inputChanged(e);
		if(e.target.value){
			this.props.dispatch(fetchCities(e.target.value));
		} else {
			this.setState({
				state: null,
				city_id: null,
			});
		}
	},
	dateChanged: function(date){
		if( date && typeof date !== "string"){
			this.setState({
				date_of_birth: date.format("YYYY-MM-DD")
			});
		} else {
			this.setState({
				date_of_birth: null,
			});
		}
	},
	onSubmit: function(e){
		e.preventDefault();
		this.setSubmitting(true);
		this.props.dispatch(saveProfileInfo(this.state)).always(() => this.setSubmitting(false));
	},
	render : function(){
		return (
			<Modal modalTitle="Edit Personal Information" onClose={hashHistory.goBack}>
				<div className="form-group"><big><i>fields marked <b>✳</b> must be filled to view available audits</i></big></div>
				{ this.state.loading ? <Loading/> :
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="First Name (✳)" maxLength="20" type="text" value={this.state.first_name} name="first_name" onChange={this.inputChanged} errors={this.props.errors.first_name} disabled={this.state.submitting}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Last Name (✳)" maxLength="20" type="text" value={this.state.last_name} name="last_name" onChange={this.inputChanged} errors={this.props.errors.last_name} disabled={this.state.submitting}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<label className="control-label">Date of Birth (✳)</label>
							<DOBPicker initialDate={moment(this.state.date_of_birth).isValid() ? moment(this.state.date_of_birth).toDate() : null} onChange={this.dateChanged} disabled={this.state.submitting} ref={(r)=>this._dobPicker=r} errors={this.state.errors.date_of_birth}/>
						</div>
						<div className="col-md-6">
							<FormSelect label="Gender (✳)" name="gender" value={this.state.gender} onChange={this.inputChanged} disabled={this.state.submitting}>
								<option value=""></option>
								<option value="M">Male</option>
								<option value="F">Female</option>
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormSelect label="Marital Status (✳)" name="marital_status" value={this.state.marital_status} onChange={this.inputChanged} errors={this.props.errors.marital_status} disabled={this.state.submitting}>
								<option value=""></option>
								<option value="S">Single</option>
								<option value="M">Married</option>
								<option value="D">Divorced</option>
								<option value="W">Widowed</option>
							</FormSelect>
						</div>
						<div className="col-md-6">
							<FormSelect label="Education (✳)" name="education" value={this.state.education} onChange={this.inputChanged} errors={this.props.errors.education} disabled={this.state.submitting}>
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
							<FormInput label="Address (✳)" maxLength="100" type="text" value={this.state.address} name="address" onChange={this.inputChanged} errors={this.props.errors.address} disabled={this.state.submitting}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Pincode (✳)" maxLength="8" type="text" value={this.state.pincode} name="pincode" onChange={this.inputChanged} errors={this.props.errors.pincode} disabled={this.state.submitting}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<StateSelector value={this.state.state} onChange={this.myStateChanged} disabled={this.state.submitting}/>
						</div>
						<div className="col-md-6">
							<CitySelector state={this.state.state} value={this.state.city_id} onChange={this.inputChanged} disabled={this.state.submitting}/>
						</div>
					</div>
					<div className="form-group">
					<button className="btn btn-lg btn-primary" disabled={this.state.submitting}>
						{ !this.state.submitting ? <span><Save/> Save</span> : "saving..."}
					</button>
					</div>
				</form>
				}
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
