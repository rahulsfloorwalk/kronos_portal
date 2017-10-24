import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { fetchStates, fetchCities, updateLocation, addLocation, fetchLocation } from '../../manager/service/location.js';

import { getInputEventChangeValue } from '../../react_utils.js';
import FormSelect from '../FormSelect.jsx';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			location: null,
			errors: {},
			form: {},
		};
	},
	componentDidMount: function() {
		fetchStates().done((states)=>this.setState({states}));
		fetchCities(this.props.params.stateId).done((cities)=>this.setState({cities}));

		if(this.props.params.locationId){
			fetchLocation(this.props.params.locationId).done((location)=> {
				this.setState({
					location,
					form: {
						name: location.name,
						pincode: location.pincode,
					},
				});
			});
		}
	},
	inputChanged: function(e){
		let change = getInputEventChangeValue(e);
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				form: Object.assign({}, prevState.form, change),
			});
		});
	},
	onSubmit: function(e){
		e.preventDefault();
		let promise;
		if(this.props.params.locationId){
			promise = updateLocation({
				id: this.props.params.locationId,
				name: this.state.form.name,
				pincode: this.state.form.pincode,
				city: this.props.params.cityId,
			});
		} else {
			promise = addLocation({
				name: this.state.form.name,
				pincode: this.state.form.pincode,
				city: this.props.params.cityId,
			});
		}
		promise.done(() => {
			hashHistory.push(`/state/${this.props.params.stateId}/city/${this.props.params.cityId}/location`);
			Alert.success("LOCATION SAVED");
		}).fail((err) => {
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	},
	render : function(){
		if( ! (this.state.states && this.state.cities)){
			return <Loading/>;
		}

		let stateName = this.state.states[this.props.params.stateId];
		let city = this.state.cities.find( c => c.id === parseInt(this.props.params.cityId)) || {};

		let modalTitle = `${stateName } / ${city.name} / `;
		modalTitle += this.props.params.locationId ? `Edit ${this.state.form.name}` : "Add Location";

		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Name" maxLength="100" type="text" value={this.state.form.name} name="name" onChange={this.inputChanged} errors={this.state.errors.name}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Pincode" maxLength="6" type="text" value={this.state.form.pincode} name="pincode" onChange={this.inputChanged} errors={this.state.errors.pincode}/>
						</div>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});
