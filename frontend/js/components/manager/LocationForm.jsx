import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchCities, loadLocationAddForm, loadLocationEditForm, saveLocationEditForm, saveLocationAddForm } from '../../manager_actions.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

var LocationForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(fetchCities());
		if(this.props.params.locationId){
			this.props.dispatch(loadLocationEditForm(this.props.params.locationId));
		} else {
			this.props.dispatch(loadLocationAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.initialValues);
		if(nextProps.initialValues && nextProps.initialValues.city){
			this.setState({
				'city': nextProps.initialValues.city.id
			});
		}

	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		if(this.props.params.locationId){
			this.props.dispatch(saveLocationEditForm(this.state));
		} else {
			this.props.dispatch(saveLocationAddForm(this.state));
		}
	},
	render : function(){
		var modalTitle = this.props.params.locationId ? "Edit Location" : "Add Location";

		var cityRows = [];
		for( var id in this.props.cities){
			cityRows.push(<option value={id} key={id}>{this.props.cities[id].name}</option>);
		}

		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Name" maxLength="100" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name}/>
					<FormInput label="Pincode" maxLength="6" type="text" value={this.state.pincode} name="pincode" onChange={this.inputChanged} errors={this.props.errors.pincode}/>
					<FormGroup>
						<label>City</label>
						<select className="form-control" name="city" value={this.state.city} onChange={this.inputChanged} errors={this.props.errors.city}>
							<option value=""></option>
							{cityRows}
						</select>
					</FormGroup>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		initialValues: store.forms.location.initialValues,
		errors: store.forms.location.errors,
		cities: store.cities
	};
};

export default ReactRedux.connect( mapStoreToProps)(LocationForm);
