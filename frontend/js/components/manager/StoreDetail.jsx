import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchStore } from '../../manager/actions/store.js';

import { Pencil } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

var StoreDetail = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchStore(this.props.params.storeId));
	},
	render: function(){
		if(! this.props.store){
			return <Loading/>;
		}
		var editLink = `/store/${this.props.params.storeId}/edit`;
		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.store.client.id}`}>{this.props.store.client.name}</Link></li>
					<li className="active">{this.props.store.name}</li>
				</ol>
				<h2 className="page-header">
					{ this.props.store.name }
				</h2>
				<div className="row">
				<div className="col-md-6">
				<Panel title="Store Info" noBody={true}>
					<table className="table table-striped">
						<tbody>
							<tr><td className="text-right">Name</td><td><b>{ this.props.store.name }</b></td></tr>
							<tr><td className="text-right">Address</td><td><b>{ this.props.store.address }</b></td></tr>
							<tr><td className="text-right">Location</td><td><b>{ this.props.store.location.name }</b></td></tr>
							<tr><td className="text-right">City</td><td><b>{ this.props.store.location.city.name }</b></td></tr>
						</tbody>
					</table>
					<div className="panel-footer text-right">
						<Link to={editLink} className="btn btn-default"><Pencil/></Link>
					</div>
				</Panel>
				</div>
				</div>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		store: store.stores[ownProps.params.storeId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(StoreDetail);
