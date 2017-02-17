import React from 'react';
import { Link } from 'react-router';

import Jumbotron from '../../js/components/Jumbotron.jsx';
import { Plus, Home } from '../../js/components/Icons.jsx';
import { fetchStores } from '../service/store.js';

var StoreRow = React.createClass({
	render: function(){
		return (
			<tr>
				<td>{this.props.store.name}</td>
				<td>{this.props.store.address}</td>
				<td>{this.props.store.location.name}</td>
				<td>
					<Link to={`/store/${this.props.store.id}/audit_store`} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			stores: []
		};
	},
	componentDidMount: function() {
		fetchStores().then((stores) => {
			this.setState({
				stores
			});
		});
	},
	render: function(){
		var rows = [];
		for(var id in this.state.stores) {
			rows.push(<StoreRow store={this.state.stores[id]} key={id}/>);
		}
		if( rows.length > 0) {
			return (
				<div>
					<h3 className="page-header">
						<Home/> Store Browser
					</h3>
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
		} else {
			return (<Jumbotron heading="there are no stores here" para="contact site administrator"/>);
		}
	},
});

