import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchClient } from '../../manager/actions/client.js';

import { Pencil } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import StoreList from './StoreList.jsx';
import AuditCycleList from './AuditCycleList.jsx';

var ClientDetail = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchClient(this.props.params.clientId));
	},
	render: function(){
		if(! this.props.client){
			return <Loading/>;
		}
		var editLink = `/client/${this.props.params.clientId}/edit`;
		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li className="active">{this.props.client.name}</li>
				</ol>
				<h2 className="page-header">
					{ this.props.client.name }
				</h2>
				<div className="row">
				<div className="col-md-6">
				<Panel title="Client Info" noBody={true}>
					<table className="table table-striped">
						<tbody>
							<tr><td className="text-right">Name</td><td><b>{ this.props.client.name }</b></td></tr>
							<tr><td className="text-right">Email</td><td><b>{ this.props.client.email }</b></td></tr>
							<tr><td className="text-right">Phone</td><td><b>{ this.props.client.phone }</b></td></tr>
						</tbody>
					</table>
					<div className="panel-footer text-right">
						<Link to={editLink} className="btn btn-default"><Pencil/></Link>
					</div>
				</Panel>
				</div>
				</div>
				<StoreList clientId={this.props.params.clientId}/>
				<AuditCycleList clientId={this.props.params.clientId}/>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		client: store.clients[ownProps.params.clientId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(ClientDetail);
