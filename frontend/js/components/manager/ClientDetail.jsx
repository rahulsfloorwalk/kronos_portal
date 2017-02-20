import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchClient } from '../../manager/actions/client.js';

import { King, Plus, Pencil, Retweet, User, Home } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';
import NavLink from '../NavLink.jsx';

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
		var clientLogo = this.props.client.logo_url ? <img style={{"padding":"10px"}} className="img-responsive" src={this.props.client.logo_url}/> : "";
		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li className="active">{this.props.client.name}</li>
				</ol>
				<div className="row">
				<div className="col-md-4">
				<Panel title={<span><King/> Client Info</span>} type="primary" noBody={true}>
					{clientLogo}
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
				<div className="col-md-8">
				<ul className="nav nav-tabs">
					<NavLink to={`/client/${this.props.params.clientId}/audit_cycle`}><Retweet/> Audit Cycles</NavLink>
					<NavLink to={`/client/${this.props.params.clientId}/store`}><Home/> Stores</NavLink>
					<NavLink to={`/client/${this.props.params.clientId}/client_user`}><User/> Users</NavLink>
				</ul>
				{this.props.children}
				</div>
				</div>
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
