import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchLocations } from '../../manager_actions.js'

var LocationRow = React.createClass({
	render: function(){
		var linkTo = `/location/${this.props.location.id}/edit`;
		return (
			<tr>
				<td>{this.props.location.name}</td>
				<td>{this.props.location.pincode}</td>
				<td>{this.props.location.city.name}</td>
				<td>
					<Link to={linkTo} className="btn btn-default">Edit</Link>
				</td>
			</tr>
		);
	},
});

var LocationList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchLocations());
	},
	render: function(){
		var rows = [];
		for(var id in this.props.locations) {
			rows.push(<LocationRow location={this.props.locations[id]} key={id}/>);
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
		locations: store.locations
	};
};

export default ReactRedux.connect(mapStoreToProps)(LocationList); 
