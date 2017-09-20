import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { fetchStates, fetchCities, fetchLocations } from '../../manager_actions.js';
import { loadStoreAddForm, loadStoreEditForm, saveStoreAddForm, saveStoreEditForm } from '../../manager/actions/store.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import FormErrorList from '../FormErrorList.jsx';
import FormSelect from '../FormSelect.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

import StateSelector from '../StateSelector.jsx';
import CitySelector from '../CitySelector.jsx';
import LocationSelector from '../LocationSelector.jsx';

var StoreForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(fetchStates());

		if(this.props.params.storeId){
			this.props.dispatch(loadStoreEditForm(this.props.params.storeId));
		} else {
			this.props.dispatch(loadStoreAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		console.log("nextProps",nextProps);
		this.setState(nextProps.store);
		if(nextProps.store && nextProps.store.location){
			this.setState({
				'location': nextProps.store.location.id,
				'city': nextProps.store.location.city.id,
				'state': nextProps.store.location.city.state
			});
			this.props.dispatch(fetchCities(nextProps.store.location.city.state));
			this.props.dispatch(fetchLocations(nextProps.store.location.city.id));
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
		var submitPromise;
		if(this.props.params.storeId){
			submitPromise = this.props.dispatch(saveStoreEditForm({
				id: this.props.params.storeId,

				client: this.state.client.id,
				location: this.state.location,

				name: this.state.name,
				address: this.state.address,
			}));
		} else {
			submitPromise = this.props.dispatch(saveStoreAddForm({
				client: this.props.params.clientId,
				location: this.state.location,

				name: this.state.name,
				address: this.state.address,
			}));
		}
		submitPromise.then(function(savedStore){
			hashHistory.push(`/client/${savedStore.client.id}/store`);
			Alert.success("STORE SAVED");
		});
	},
	render : function(){
		var modalTitle = this.props.params.auditLocationId ? "Edit Store" : "Add Store";
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
							<LocationSelector value={this.state.location} onChange={this.inputChanged} errors={this.props.errors.location}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Name" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-12">
							<FormInput label="Address" type="text" value={this.state.address} name="address" onChange={this.inputChanged} errors={this.props.errors.address}/>
						</div>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		store: store.stores[ownProps.params.storeId] || {},
		errors: store.forms.store.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(StoreForm);
