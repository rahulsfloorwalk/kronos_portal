import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchStates, fetchLocations } from '../../manager_actions.js'

var LocationList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchLocations());
		this.props.dispatch(fetchStates());
	},
	render: function(){
		var rows = [];
		for(var id in this.props.locations) {
			var linkTo = `/location/${this.props.locations[id].id}/edit`;
			rows.push(
				<tr key={id}>
					<td>{this.props.locations[id].name}</td>
					<td>{this.props.locations[id].pincode}</td>
					<td>{this.props.locations[id].city.name}</td>
					<td>{this.props.states[this.props.locations[id].city.state]}</td>
					<td>
						<Link to={linkTo} className="btn btn-default">Edit</Link>
					</td>
				</tr>
			);
		}
		return (
			<div>
				<h2 className="page-header">
					<Link to="/location/add" className="btn btn-primary pull-right">Add Location</Link>
					Location List
				</h2>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Name</th>
							<th>Pincode</th>
							<th>City</th>
							<th>State</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		locations: store.locations,
		states: store.states
	};
};

export default ReactRedux.connect(mapStoreToProps)(LocationList); 
