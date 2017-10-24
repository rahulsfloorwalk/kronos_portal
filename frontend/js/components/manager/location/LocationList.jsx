import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Alert from 'react-s-alert';

import { fetchStates, fetchCities, fetchLocations, deleteLocation } from '../../../manager/service/location.js';

import { Cross, Plus, Pencil, MapMarker } from '../../Icons.jsx';
import Loading from '../../Loading.jsx';

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	reloadLocations: function(stateId, cityId){
		fetchStates().done((states)=>this.setState({states}));
		fetchCities(stateId).done((cities)=>this.setState({cities}));
		fetchLocations(cityId).done((locations)=>this.setState({locations}));
	},
	componentDidMount: function() {
		this.reloadLocations(this.props.params.stateId, this.props.params.cityId);
	},
	componentWillReceiveProps: function(nextProps){
		this.reloadLocations(nextProps.params.stateId, nextProps.params.cityId);
	},
	locationDelete: function(locationId){
		deleteLocation(locationId).done(() => {
			this.reloadLocations(this.props.params.stateId, this.props.params.cityId);
			Alert.success("LOCATION DELETED");
		}).fail(() => Alert.warning("LOCATION CANNOT BE DELETED"));
	},
	render: function(){
		if( ! this.state.states || ! this.state.cities || ! this.state.locations){
			return <Loading/>;
		}
		let stateName = this.state.states[this.props.params.stateId];
		let city = this.state.cities.find( c => c.id === parseInt(this.props.params.cityId)) || {};

		let rows = [];
		for(let l of this.state.locations) {
			let linkTo = `/state/${this.props.params.stateId}/city/${this.props.params.cityId}/location/${l.id}/edit`;
			rows.push(
				<tr key={l.id}>
					<td>{l.name}</td>
					<td>{l.pincode}</td>
					<td>
						<Link to={linkTo} className="btn btn-default"><Pencil/> Edit</Link>
						&nbsp;
						<button className="btn btn-default" title="Delete Location" type="button" onClick={()=>this.locationDelete(l.id)}><Cross/></button>
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

					<Link to="/state">States</Link> / <Link to={cityLink}>{stateName }</Link> / <b>{city.name }</b> / Location List
					<a href={city.gmaps_url} className="btn btn-link" target="_blank">
						<MapMarker/>
					</a>
				</h2>
				{table}
				{this.props.children}
			</div>
		);
	},
});
