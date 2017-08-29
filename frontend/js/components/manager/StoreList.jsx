import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { Plus, Home, Pencil } from '../Icons.jsx';
import { fetchStores } from '../../manager/actions/store.js'

var StoreRow = React.createClass({
	render: function(){
		var linkTo = `/client/${this.props.store.client.id}/store/${this.props.store.id}/edit`;
		return (
			<tr>
				<td>{this.props.store.name}</td>
				<td>{this.props.store.address}</td>
				<td>
					{this.props.store.location.name}, <br/>
					{this.props.store.location.city.name}, <br/>
					{this.props.store.location.city.state}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right"><Pencil/></Link>
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
					<colgroup>
						<col style={{width: "25%"}}/>
						<col style={{width: "50%"}}/>
						<col style={{width: "20%"}}/>
						<col style={{width: "5%"}}/>
					</colgroup>
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
		stores: store.stores,

	};
};

export default ReactRedux.connect(mapStoreToProps)(StoreList); 
