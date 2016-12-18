import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchStates, fetchCities, fetchLocations } from '../../manager_actions.js';
import { fetchLocationsByCity, loadAuditLocationAddForm, loadAuditLocationEditForm, saveAuditLocationAddForm, saveAuditLocationEditForm } from '../../manager/actions/audit.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import FormErrorList from '../FormErrorList.jsx';
import FormSelect from '../FormSelect.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

var AuditLocationForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		this.props.dispatch(fetchCities());
		this.props.dispatch(fetchLocations());

		if(this.props.params.auditLocationId){
			this.props.dispatch(loadAuditLocationEditForm(this.props.params.auditLocationId));
		} else {
			this.props.dispatch(loadAuditLocationAddForm());
		}
	},
	componentWillReceiveProps: function(nextProps) {
		console.log("nextProps",nextProps);
		this.setState(nextProps.auditLocation);
		if(nextProps.auditLocation && nextProps.auditLocation.location){
			this.setState({
				'location': nextProps.auditLocation.location.id,
				'city': nextProps.auditLocation.location.city.id
			});
		}
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		if(this.props.params.auditLocationId){
			this.props.dispatch(saveAuditLocationEditForm({
				id: this.props.params.auditLocationId,
				count: this.state.count,
				location: this.state.location,
				audit: this.props.params.auditId
			}));
		} else {
			this.props.dispatch(saveAuditLocationAddForm({
				count: this.state.count,
				location: this.state.location,
				audit: this.props.params.auditId
			}));
		}
	},
	render : function(){
		var cityRows = [];
		for( var id in this.props.cities){
			cityRows.push(<option value={id} key={id}>{this.props.cities[id].name}</option>);
		}

		var locationRows = [];
		if( this.state.city){
			for( var id in this.props.locations){
				if(this.props.locations[id].city.id === parseInt(this.state.city)){
					locationRows.push(<option value={id} key={id}>{this.props.locations[id].name}</option>);
				}
			}
		}

		var modalTitle = this.props.params.auditLocationId ? "Edit Audit Location" : "Add Audit Location";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<div className="row">
						<div className="col-sm-6">
							<FormSelect label="City" name="city" value={this.state.city} onChange={this.inputChanged}>
								<option value=""></option>
								{cityRows}
							</FormSelect>
						</div>
						<div className="col-sm-6">
							<FormSelect label="Location" name="location" value={this.state.location} onChange={this.inputChanged} errors={this.props.errors.location}>
								<option value=""></option>
								{locationRows}
							</FormSelect>
						</div>
					</div>
					<FormInput label="Count" type="number" value={this.state.count} name="count" onChange={this.inputChanged} errors={this.props.errors.count}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	console.log("ownProps.auditLocationId",ownProps.params.auditLocationId);
	var auditLocation = store.audits[ownProps.params.auditId].auditlocations.filter((al) => al.id === parseInt(ownProps.params.auditLocationId))[0];
	console.debug("found al:",auditLocation);
	return {
		auditLocation: auditLocation || {},
		errors: store.forms.auditLocation.errors,
		cities: store.cities,
		locations: store.locations,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditLocationForm);
