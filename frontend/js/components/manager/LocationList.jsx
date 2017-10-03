import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Alert from 'react-s-alert';

import { fetchStates, fetchCities, fetchLocations, deleteLocation } from '../../manager/actions/location.js';

import { Cross, Plus, Pencil, MapMarker } from '../Icons.jsx';

var LocationList = React.createClass({
	reloadLocations: function(){
		this.props.dispatch(fetchLocations(this.props.params.cityId));
	},
	componentDidMount: function() {
		this.props.dispatch(fetchStates());
		this.props.dispatch(fetchCities(this.props.params.stateId));
		this.reloadLocations();
	},
	locationDelete: function(locationId){
		this.props.dispatch(deleteLocation(locationId)).done(() => {
			this.reloadLocations();
			Alert.success("LOCATION DELETED");
		}).fail(() => Alert.warning("LOCATION CANNOT BE DELETED"));
	},
	render: function(){
		var rows = [];
		for(let id in this.props.locations) {
			let linkTo = `/state/${this.props.params.stateId}/city/${this.props.params.cityId}/location/${this.props.locations[id].id}/edit`;
			rows.push(
				<tr key={id}>
					<td>{this.props.locations[id].name}</td>
					<td>{this.props.locations[id].pincode}</td>
					<td>
						<Link to={linkTo} className="btn btn-default"><Pencil/> Edit</Link>
						&nbsp;
						<button className="btn btn-default" title="Delete Location" type="button" onClick={()=>this.locationDelete(id)}><Cross/></button>
					</td>
				</tr>
			);
		}

		if( rows.length > 0){
			var table = (
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Name</th>
							<th>Pincode</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			);
		} else {
			var table = (
				<div className="jumbotron text-center">
					<h2>no locations found</h2>
					<p>you can add a new one by clicking the button on the top right..</p>
				</div>
			);
		}
		var cityLink = `/state/${this.props.params.stateId}/city`;
		var addLocationLink = `/state/${this.props.params.stateId}/city/${this.props.params.cityId}/location/add`;
		return (
			<div>
				<h2 className="page-header">
					<Link to={addLocationLink} className="btn btn-default pull-right"><Plus/> Add Location</Link>

					<Link to="/state">States</Link> / <Link to={cityLink}>{this.props.stateName }</Link> / <b>{this.props.city.name }</b> / Location List
					<a href={this.props.city.gmaps_url} className="btn btn-link" target="_blank">
						<MapMarker/>
					</a>
				</h2>
				{table}
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		locations: store.locations,
		stateName: store.states[ownProps.params.stateId],
		city: store.cities.filter( c => c.id === parseInt(ownProps.params.cityId))[0] || {},
	};
};

export default ReactRedux.connect(mapStoreToProps)(LocationList); 
