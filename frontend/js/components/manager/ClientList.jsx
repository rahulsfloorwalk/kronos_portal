import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchClients } from '../../manager/actions/client.js'

var ClientRow = React.createClass({
	render: function(){
		var linkTo = `/client/${this.props.client.id}`;
		return (
			<tr>
				<td>{this.props.client.name}</td>
				<td>{this.props.client.email}</td>
				<td>{this.props.client.phone}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

var ClientList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchClients());
	},
	render: function(){
		var rows = [];
		for(var id in this.props.clients) {
			rows.push(<ClientRow client={this.props.clients[id]} key={id}/>);
		}
		return (
			<div>
				<h2 className="page-header">
					<Link to="/client/add" className="btn btn-primary pull-right">Add Client</Link>
					Client List
				</h2>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Phone</th>
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
		clients: store.clients
	};
};

export default ReactRedux.connect(mapStoreToProps)(ClientList); 
