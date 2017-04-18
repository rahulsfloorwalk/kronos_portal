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

var LocationForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		if(this.props.params.locationId){
			this.props.dispatch(loadLocationEditForm(this.props.params.locationId));
		} else {
			this.props.dispatch(loadLocationAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.location);
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		if(this.props.params.locationId){
			var promise = this.props.dispatch(saveLocationEditForm({
				id: this.props.location.id,
				name: this.state.name,
				pincode: this.state.pincode,
				city: this.props.params.cityId
			}));
			promise.done(() => hashHistory.push(`/state/${this.props.params.stateId}/city/${this.props.params.cityId}/location`));
		} else {
			var promise = this.props.dispatch(saveLocationAddForm({
				name: this.state.name,
				pincode: this.state.pincode,
				city: this.props.params.cityId
			}));
			promise.done(() => hashHistory.push(`/state/${this.props.params.stateId}/city/${this.props.params.cityId}/location`));
		}
	},
	render : function(){
		var modalTitle = `${this.props.stateName } / ${this.props.city.name} / `;
		modalTitle += this.props.params.locationId ? `Edit ${this.state.name}` : "Add Location";

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
		stateName: store.states[ownProps.params.stateId],
		city: store.cities.filter( c => c.id === parseInt(ownProps.params.cityId))[0] || {},
	};
};

export default ReactRedux.connect( mapStoreToProps)(LocationForm);
