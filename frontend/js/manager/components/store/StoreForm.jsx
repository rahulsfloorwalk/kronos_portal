import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

// import { fetchCountry, fetchStates, fetchStatesByCountry, fetchCities } from "../../actions/location.js";
import { fetchCountry, fetchStatesByCountry, fetchCities } from "../../actions/location.js";
import { loadStoreAddForm, loadStoreEditForm, saveStoreAddForm, saveStoreEditForm, fetchStores } from "../../actions/store.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";

import CountrySelector from "../../../components/CountrySelector.jsx";
import StateSelector from "../../../components/StateSelector.jsx";
import CitySelector from "../../../components/CitySelector.jsx";

import { storePropType, errorList } from "../../prop_types";

class StoreForm extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			clientId: PropTypes.string,
			storeId: PropTypes.string,
		}),
		store: storePropType,
		errors: PropTypes.shape({
			name: errorList,
			code: errorList,
			pincode: errorList,
			map_location_link: errorList,
			type: errorList,
			address: errorList,
			priority: errorList,
			phone: errorList,
			non_field_errors: errorList,
		}),
	};
	state = {
		country: "",
		state: "",
		city: "",
		city_error: "",
		state_error: [],
		store_region: "city"
	};

	componentDidMount() {
		this.props.dispatch(fetchCountry());
		// this.props.dispatch(fetchStates());

		if(this.props.params.storeId){
			this.props.dispatch(loadStoreEditForm(this.props.params.storeId));
		} else {
			this.props.dispatch(loadStoreAddForm());
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState(nextProps.store);
		if(nextProps.store && nextProps.store.city){
			this.setState({
				"country": nextProps.store.city.country,
				"city": nextProps.store.city.id,
				"state": nextProps.store.city.state
			});
			this.props.dispatch(fetchStatesByCountry(nextProps.store.city.country));
			this.props.dispatch(fetchCities(nextProps.store.city.state));
		}
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

	onSubmit = (e) => {
		e.preventDefault();
		if(this.state.store_region == "city"){
			if(typeof this.state.city === "undefined" || this.state.city === ""){
				this.setState({
					city_error: "Please select city",
					state_error: []
				});
				return false;
			}
		}
		if(this.state.store_region == "state"){
			if(typeof this.state.state == undefined || this.state.state == ""){
				this.setState({
					city_error: "",
					state_error: ["Please select state"]
				});
				return false;
			}
		}
		var submitPromise;
		if(this.props.params.storeId){
			submitPromise = this.props.dispatch(saveStoreEditForm({
				id: this.props.params.storeId,

				client: this.state.client.id,
				city: this.state.city,

				name: this.state.name,
				address: this.state.address,

				code: this.state.code,
				pincode: this.state.pincode,
				map_location_link: this.state.map_location_link,
				type: this.state.type,
				priority: this.state.priority,
				phone: this.state.phone,
			}));
		} else {
			submitPromise = this.props.dispatch(saveStoreAddForm({
				client: this.props.params.clientId,
				country: this.state.country,
				state: this.state.state,
				city: this.state.city,

				name: this.state.name,
				address: this.state.address,

				code: this.state.code,
				pincode: this.state.pincode,
				map_location_link: this.state.map_location_link,
				type: this.state.type,
				priority: this.state.priority,
				phone: this.state.phone,
				store_region: this.state.store_region,
			}));
		}
		submitPromise.then(() => {
			if(this.state.store_region == "state" || this.state.store_region == "country"){
				this.props.dispatch(fetchStores(this.props.params.clientId));
			}
			hashHistory.push(`/client/${this.props.params.clientId}/store`);
			Alert.success("STORE SAVED");
		});
	};

	setStoreRegion = (e) => {
		this.inputChanged(e);
		let value = e.target.value;
		if(value == "country"){
			this.setState({state: "", city: ""});
		}
		else if(value == "state"){
			this.setState({city: ""});
		}
		else if(value == "city"){
			this.setState({country: "", state: ""});
		}
	};

	render() {
		var modalTitle = this.props.params.storeId ? "Edit Store" : "Add Store";
		var city_error_span = (<span style={{color:"red"}}><b>{this.state.city_error}</b></span>);
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					{city_error_span}
					{this.props.errors.non_field_errors != undefined ? <FormErrorList errors={this.props.errors.non_field_errors}/> : null}
					{ typeof this.props.params.storeId == "undefined" ?
						<div className="form-group">
							<label>Select store region</label>
							<br />
							{/* <label htmlFor="id_country">
								<input type="radio" value="country" name="store_region" id="id_country" onClick={this.setStoreRegion}/>&nbsp;Country
							</label>
							&nbsp;&nbsp; */}
							<label htmlFor="id_state">
								<input type="radio" value="state" name="store_region" id="id_state" onClick={this.setStoreRegion} />&nbsp;State
							</label>
							&nbsp;&nbsp;
							<label htmlFor="id_city">
								<input type="radio" value="city" name="store_region" defaultChecked="true" id="id_city" onClick={this.setStoreRegion} />&nbsp;City
							</label>
						</div>
						: null }
					<div className="row">
						{this.state.store_region == "country" || this.state.store_region == "state" || this.state.store_region == "city" ?
							<div className="col-sm-6">
								<CountrySelector value={this.state.country} onChange={this.myCountryChanged}/>
							</div>
							: null }
						{this.state.store_region == "state" || this.state.store_region == "city" ?
							<div className="col-sm-6">
								<StateSelector value={this.state.state} onChange={this.myStateChanged} errors={this.state.state_error}/>
							</div>
							: null }
						{this.state.store_region == "city" ?
							<div className="col-sm-6">
								<CitySelector value={this.state.city} onChange={this.myCityChanged}/>
							</div>
							: null }
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
							<FormInput label="Location link" type="text" value={this.state.map_location_link} name="map_location_link" onChange={this.inputChanged} errors={this.props.errors.map_location_link}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Priority" type="number" value={this.state.priority} name="priority" onChange={this.inputChanged} errors={this.props.errors.priority}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Phone Number" type="text" value={this.state.phone} name="phone" onChange={this.inputChanged} errors={this.props.errors.phone}/>
						</div>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		store: store.stores[ownProps.params.storeId] || {},
		errors: store.forms.store.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(StoreForm);
