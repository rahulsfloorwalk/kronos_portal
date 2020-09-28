import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

// import { fetchCountry, fetchStates, fetchStatesByCountry, fetchCities } from "../../actions/location.js";
import { fetchCountry, fetchStatesByCountry, fetchCities } from "../../actions/location.js";
import { loadStoreAddForm, loadStoreEditForm, saveStoreAddForm, saveStoreEditForm } from "../../actions/store.js";

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
			type: errorList,
			address: errorList,
			priority: errorList,
			phone: errorList,
			non_field_errors: errorList,
		}),
	};
	state = {};

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
	};

	onSubmit = (e) => {
		e.preventDefault();
		var submitPromise;
		if(this.props.params.storeId){
			submitPromise = this.props.dispatch(saveStoreEditForm({
				id: this.props.params.storeId,

				client: this.state.client.id,
				city: this.state.city,

				name: this.state.name,
				address: this.state.address,

				code: this.state.code,
				type: this.state.type,
				priority: this.state.priority,
				phone: this.state.phone,
			}));
		} else {
			submitPromise = this.props.dispatch(saveStoreAddForm({
				client: this.props.params.clientId,
				city: this.state.city,

				name: this.state.name,
				address: this.state.address,

				code: this.state.code,
				type: this.state.type,
				priority: this.state.priority,
				phone: this.state.phone,
			}));
		}
		submitPromise.then(function(savedStore){
			hashHistory.push(`/client/${savedStore.client.id}/store`);
			Alert.success("STORE SAVED");
		});
	};

	render() {
		var modalTitle = this.props.params.storeId ? "Edit Store" : "Add Store";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<div className="row">
						<div className="col-sm-6">
							<CountrySelector value={this.state.country} onChange={this.myCountryChanged}/>
						</div>
						<div className="col-sm-6">
							<StateSelector value={this.state.state} onChange={this.myStateChanged}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<CitySelector value={this.state.city} onChange={this.myCityChanged}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Name" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Code" type="text" value={this.state.code} name="code" onChange={this.inputChanged} errors={this.props.errors.code}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Type" type="text" value={this.state.type} name="type" onChange={this.inputChanged} errors={this.props.errors.type}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Address" type="text" value={this.state.address} name="address" onChange={this.inputChanged} errors={this.props.errors.address}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Priority" type="text" value={this.state.priority} name="priority" onChange={this.inputChanged} errors={this.props.errors.priority}/>
						</div>
					</div>
					<div className="row">
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
