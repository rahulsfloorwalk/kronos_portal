import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { Plus, Home } from '../Icons.jsx';
import { fetchStores } from '../../manager/actions/store.js'

var StoreRow = React.createClass({
	render: function(){
		var linkTo = `/store/${this.props.store.id}`;
		return (
			<tr>
				<td>{this.props.store.name}</td>
				<td>{this.props.store.address}</td>
				<td>{this.props.store.location.name}, {this.props.store.location.city.name}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

var StoreList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchStores(this.props.params.clientId));
	},
	render: function(){
		var rows = [];
		for(var id in this.props.stores) {
			rows.push(<StoreRow store={this.props.stores[id]} key={id}/>);
		}
		var addStoreLink = `/client/${this.props.params.clientId}/store/add`;
		return (
			<div>
				<h3 className="page-header">
					<Link to={addStoreLink} className="btn btn-default pull-right"><Plus/> Add Store</Link>
					<Home/> Store List
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Name</th>
							<th>Address</th>
							<th>Location</th>
							<th></th>
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

var mapStoreToProps = function(store, ownProps){
	return {
		stores: store.stores
	};
};

export default ReactRedux.connect(mapStoreToProps)(StoreList); 
