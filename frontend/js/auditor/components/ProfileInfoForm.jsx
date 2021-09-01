import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import moment from "moment";

// import { fetchCountries, fetchStates, fetchStatesByCountry, fetchCities } from "../actions/location_info.js";
import { fetchCountries, fetchStatesByCountry, fetchCities } from "../actions/location_info.js";
import { fetchProfileInfo, saveProfileInfo } from "../actions/profile_info.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormInput from "../../components/FormInput.jsx";
import { Save } from "../../components/Icons.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import Modal from "../../components/Modal.jsx";
import DOBPicker from "../../components/DOBPicker.jsx";
import Loading from "../../components/Loading.jsx";

/* Country Selector begins */

class __CountrySelector extends React.Component {
	static propTypes = {
		countries: PropTypes.object,
	};

	render() {
		let countryOptions = [];
		for( let c in this.props.countries){
			countryOptions.push(<option key={c} value={c}>{this.props.countries[c]}</option>);
		}
		return (
			<FormSelect label="Country" required_mark={true} name="country" {...this.props}>
				<option value=""></option>
				{countryOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForCountrySelector = function(store){
	return {
		countries: store.countries,
	};
};

var CountrySelector = ReactRedux.connect(mapStoreToPropsForCountrySelector)(__CountrySelector);

/* Country Selector ends */

/* State Selector begins */

class __StateSelector extends React.Component {
	static propTypes = {
		states: PropTypes.object,
	};

	render() {
		let stateOptions = [];
		for( let s in this.props.states){
			stateOptions.push(<option key={s} value={s}>{this.props.states[s]}</option>);
		}
		return (
			<FormSelect label="State" required_mark={true} name="state" {...this.props}>
				<option value=""></option>
				{stateOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForStateSelector = function(store){
	return {
		states: store.country_states,
	};
};

var StateSelector = ReactRedux.connect(mapStoreToPropsForStateSelector)(__StateSelector);

/* State Selector Ends */

/* City Selector Starts */

class __CitySelector extends React.Component {
	static propTypes = {
		state: PropTypes.string,
		cities: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		})),
	};

	static defaultProps = {
		state: null,
	};

	render() {
		let cityOptions = [];
		for( let c of this.props.cities){
			if( c.state === this.props.state){
				cityOptions.push(<option key={c.id} value={c.id}>{c.name}</option>);
			}
		}
		return (
			<FormSelect label="City" required_mark={true} name="city_id" {...this.props}>
				<option value=""></option>
				{cityOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForCitySelector = function(store){
	return {
		cities: store.cities,
	};
};

var CitySelector = ReactRedux.connect(mapStoreToPropsForCitySelector)(__CitySelector);

/* City Selector Ends */

const errorPropType = PropTypes.arrayOf(PropTypes.string);

class ProfileInfoForm extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		errors: PropTypes.shape({
			first_name: errorPropType,
			last_name: errorPropType,
			marital_status: errorPropType,
			education: errorPropType,
			address: errorPropType,
			pincode: errorPropType,
		}),
	};

	state = {
		profileInfo: {},
		loading: false,
		submitting: false,
		errors: {},
	};

	setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	};

	setSubmitting = (submitting) => {
		this.setState((prevState) => Object.assign({}, prevState, { submitting }));
	};

	componentDidMount() {
		this.setLoading(true);
		Promise.all([
			this.props.dispatch(fetchProfileInfo()),
			this.props.dispatch(fetchCountries()),
			// this.props.dispatch(fetchStates()),
		]).then(([profileInfo] )=> {
			this.setLoading(false);
			this.setState(profileInfo);
			if(profileInfo.city){
				this.setState({
					state: profileInfo.city.state,
					country: profileInfo.city.country,
				});
				this.props.dispatch(fetchStatesByCountry(profileInfo.city.country)),
				this.props.dispatch(fetchCities(profileInfo.city.state));
			}
		});
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	myCountryChanged = (e) => {
		this.inputChanged(e);
		if(e.target.value){
			this.props.dispatch(fetchStatesByCountry(e.target.value));
			this.setState({
				state: ""
			});
		} else {
			this.setState({
				state: "",
				city_id: "",
			});
		}
	};

	myStateChanged = (e) => {
		this.inputChanged(e);
		if(e.target.value){
			this.props.dispatch(fetchCities(e.target.value));
		} else {
			this.setState({
				state: "",
				city_id: "",
			});
		}
	};

	dateChanged = (date) => {
		if( date && typeof date !== "string"){
			this.setState({
				date_of_birth: date.format("YYYY-MM-DD")
			});
		} else {
			this.setState({
				date_of_birth: null,
			});
		}
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.setSubmitting(true);
		this.props.dispatch(saveProfileInfo(this.state)).always(() => this.setSubmitting(false));
	};

	render() {
		return (
			<Modal modalTitle="Edit Personal Information" onClose={hashHistory.goBack}>
				<div className="form-group"><big><i>fields marked <b className="text-danger">✳</b> must be filled to view available audits</i></big></div>
				{ this.state.loading ? <Loading/> :
					<form onSubmit={this.onSubmit}>
						<div className="row">
							<div className="col-md-4">
								<FormSelect label="Pronouns" required_mark={true} name="pronouns" value={this.state.pronouns} onChange={this.inputChanged} >
									<option value=""></option>
									<option value="hh">He/Him</option>
									<option value="sh">She/Her</option>
									<option value="tt">They/Them</option>
									<option value="ht">He/They</option>
									<option value="st">She/They</option>
								</FormSelect>
							</div>
							<div className="col-md-4">
								<FormInput label="First Name" required_mark={true} maxLength="20" type="text" value={this.state.first_name} name="first_name" onChange={this.inputChanged} errors={this.props.errors.first_name} disabled={this.state.submitting}/>
							</div>
							<div className="col-md-4">
								<FormInput label="Last Name" required_mark={true} maxLength="20" type="text" value={this.state.last_name} name="last_name" onChange={this.inputChanged} errors={this.props.errors.last_name} disabled={this.state.submitting}/>
							</div>
						</div>
						<div className="row">
							<div className="col-md-6">
								<label className="control-label">Date of Birth <span className="text-danger">(✳)</span></label>
								<DOBPicker initialDate={moment(this.state.date_of_birth).isValid() ? moment(this.state.date_of_birth).toDate() : null} onChange={this.dateChanged} disabled={this.state.submitting} ref={(r)=>this._dobPicker=r} errors={this.state.errors.date_of_birth}/>
							</div>
							<div className="col-md-6">
								<FormSelect label="Gender" required_mark={true} name="gender" value={this.state.gender} onChange={this.inputChanged} disabled={this.state.submitting}>
									<option value=""></option>
									<option value="M">Male</option>
									<option value="F">Female</option>
									<option value="N">Trans person</option>
									<option value="N">Non-binary</option>
								</FormSelect>
							</div>
						</div>
						<div className="row">
							<div className="col-md-6">
								<FormSelect label="Marital Status" required_mark={true} name="marital_status" value={this.state.marital_status} onChange={this.inputChanged} errors={this.props.errors.marital_status} disabled={this.state.submitting}>
									<option value=""></option>
									<option value="S">Single</option>
									<option value="M">Married</option>
									<option value="D">Divorced</option>
									<option value="W">Widowed</option>
								</FormSelect>
							</div>
							<div className="col-md-6">
								<FormSelect label="Education" required_mark={true} name="education" value={this.state.education} onChange={this.inputChanged} errors={this.props.errors.education} disabled={this.state.submitting}>
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
								<FormInput label="Address" required_mark={true} maxLength="100" type="text" value={this.state.address} name="address" onChange={this.inputChanged} errors={this.props.errors.address} disabled={this.state.submitting}/>
							</div>
							<div className="col-md-6">
								<FormInput label="Pincode" required_mark={true} maxLength="8" type="text" value={this.state.pincode} name="pincode" onChange={this.inputChanged} errors={this.props.errors.pincode} disabled={this.state.submitting}/>
							</div>
						</div>
						<div className="row">
							<div className="col-md-6">
								<CountrySelector value={this.state.country} onChange={this.myCountryChanged} disabled={this.state.submitting}/>
							</div>
							<div className="col-md-6">
								<StateSelector value={this.state.state} onChange={this.myStateChanged} 	disabled={this.state.submitting}/>

							</div>
						</div>
						<div className="row">
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
	}
}

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		errors: store.forms.profileInfo.errors || {},
	};
};

export default ReactRedux.connect( mapStoreToProps)(ProfileInfoForm);
