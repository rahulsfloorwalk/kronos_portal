import React, {Component} from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Alert from "react-s-alert";

import { fetchCountry, fetchStatesByCountry, fetchCities } from "../../../actions/location.js";
import { saveStoreAddForm, fetchStores } from "../../../actions/store.js";

import { affectInputEventToComponent } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";

import CountrySelector from "../../../../components/CountrySelector.jsx";
import StateSelector from "../../../../components/StateSelector.jsx";
import CitySelector from "../../../../components/CitySelector.jsx";

import { errorList } from "../../../prop_types";

class StoreAddForm extends Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		clientId: PropTypes.number.isRequired,
		errors: PropTypes.shape({
			name: errorList,
			code: errorList,
			pincode: errorList,
			type: errorList,
			address: errorList,
			priority: errorList,
			phone: errorList,
			map_location_link: errorList,
			non_field_errors: errorList,
		}),
	};
	state = {
		country: "",
		state: "",
		city: "",
		city_error: "",
		map_location_link: "",
		store_region: "city",
		state_error: [],
	};

	componentDidMount() {
		this.props.dispatch(fetchCountry());
	}

	componentWillReceiveProps(nextProps) {
		nextProps.dispatch(fetchCountry());
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	myCountryChanged = (e) => {
		this.inputChanged(e);
		var countryCode = e.target.value;
		if(countryCode){
			this.props.dispatch(fetchStatesByCountry(e.target.value));
			this.setState({
				"state": "",
				"city": ""
			});
		}
	};

	myStateChanged = (e) => {
		this.inputChanged(e);
		var stateCode = e.target.value;
		if( stateCode){
			this.props.dispatch(fetchCities(e.target.value));
			this.setState({
				"city": ""
			});
		}
	};

	myCityChanged = (e) => {
		this.inputChanged(e);
		this.setState({
			city_error: ""
		});
	};

	onReset = (e) => {
		e.preventDefault();
		this.setState({
			country: "",
			state: "",
			city: "",
			city_error: "",
			map_location_link: "",
			name: "",
			address: "",
			code: "",
			pincode: "",
			type: "",
			priority: "",
			phone: "",
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		if(typeof this.state.city === "undefined" || this.state.city === ""){
			this.setState({
				city_error: "Please select city"
			});
		}
		else {
			var submitPromise;
			submitPromise = this.props.dispatch(saveStoreAddForm({
				client: this.props.clientId,
				country: this.state.country,
				state: this.state.state,
				city: this.state.city,

				name: this.state.name,
				address: this.state.address,

				code: this.state.code,
				pincode: this.state.pincode,
				type: this.state.type,
				priority: this.state.priority,
				phone: this.state.phone,
				store_region: this.state.store_region,
				map_location_link: this.state.map_location_link
			}));
			submitPromise.then(() => {
				this.props.dispatch(fetchStores(this.props.clientId));
				Alert.success("STORE SAVED");
			});
		}
	};

	render() {
		var city_error_span = (<span style={{color:"red"}}><b>{this.state.city_error}</b></span>);
		return (
			<form onSubmit={this.onSubmit} ref={(el) => this.storeFormRef = el}>
				{city_error_span}
				{this.props.errors.non_field_errors != undefined ? <FormErrorList errors={this.props.errors.non_field_errors}/> : null}
				<div className="row">
					<div className="col-sm-6">
						<CountrySelector value={this.state.country} onChange={this.myCountryChanged}/>
					</div>
					<div className="col-sm-6">
						<StateSelector value={this.state.state} onChange={this.myStateChanged}/>
					</div>
					<div className="col-sm-6">
						<CitySelector value={this.state.city} onChange={this.myCityChanged}/>
					</div>
					<div className="col-sm-6">
						<FormInput label="Name" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name}/>
					</div>
					<div className="col-sm-6">
						<FormInput label="Code" type="text" value={this.state.code} name="code" onChange={this.inputChanged} errors={this.props.errors.code}/>
					</div>
					<div className="col-sm-6">
						<FormInput label="Pincode" type="text" value={this.state.pincode} name="pincode" onChange={this.inputChanged} errors={this.props.errors.pincode}/>
					</div>
					<div className="col-sm-6">
						<FormInput label="Type" type="text" value={this.state.type} name="type" onChange={this.inputChanged} errors={this.props.errors.type}/>
					</div>
					<div className="col-sm-6">
						<FormInput label="Address" type="text" value={this.state.address} name="address" onChange={this.inputChanged} errors={this.props.errors.address}/>
					</div>
					<div className="col-sm-6">
						<FormInput label="Priority" type="number" value={this.state.priority} name="priority" onChange={this.inputChanged} errors={this.props.errors.priority}/>
					</div>
					<div className="col-sm-6">
						<FormInput label="Location Link" type="text" value={this.state.map_location_link} name="map_location_link" onChange={this.inputChanged} errors={this.props.errors.map_location_link}/>
					</div>
					<div className="col-sm-6">
						<FormInput label="Phone Number" type="text" value={this.state.phone} name="phone" onChange={this.inputChanged} errors={this.props.errors.phone}/>
					</div>
				</div>
				<SaveButton/>&nbsp;&nbsp;<button type="button" className="btn btn-warning" onClick={this.onReset}>Reset</button>
			</form>
		);
	}
}


var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
		errors: store.forms.store.errors,
	};
};

export default connect( mapStoreToProps)(StoreAddForm);