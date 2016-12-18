import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchStates, fetchCities, fetchLocations } from '../../manager_actions.js'

var LocationList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchStates());
		this.props.dispatch(fetchCities(this.props.params.stateId));
		this.props.dispatch(fetchLocations(this.props.params.cityId));
	},
	render: function(){
		var rows = [];
		for(var id in this.props.locations) {
			var linkTo = `/state/${this.props.params.stateId}/city/${this.props.params.cityId}/location/${this.props.locations[id].id}/edit`;
			rows.push(
				<tr key={id}>
					<td>{this.props.locations[id].name}</td>
					<td>{this.props.locations[id].pincode}</td>
					<td>
						<Link to={linkTo} className="btn btn-default">Edit</Link>
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
					<p>you can add a new one by clicking the button on the top left..</p>
				</div>
			);
		}
		var cityLink = `/state/${this.props.params.stateId}/city`;
		var addLocationLink = `/state/${this.props.params.stateId}/city/${this.props.params.cityId}/location/add`;
		return (
			<div>
				<h2 className="page-header">
					<Link to={addLocationLink} className="btn btn-primary pull-right">Add Location</Link>

					<Link to="/state">States</Link> / <Link to={cityLink}>{this.props.stateName }</Link> / <b>{this.props.city.name }</b> / Location List
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
		city: store.cities[ownProps.params.cityId] || {},
	};
};

export default ReactRedux.connect(mapStoreToProps)(LocationList); 
