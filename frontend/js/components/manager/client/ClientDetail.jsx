import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchClient } from '../../../manager/service/client.js';

import { King, Plus, Pencil, Retweet, User, Home } from '../../Icons.jsx';
import Panel from '../../Panel.jsx';
import Loading from '../../Loading.jsx';
import NavLink from '../../NavLink.jsx';

import StoreList from './../StoreList.jsx';
import AuditCycleList from './../AuditCycleList.jsx';

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function(){
		fetchClient(this.props.params.clientId).done((client)=> this.setState({client}));
	},
	componentWillReceiveProps: function(nextProps){
		fetchClient(nextProps.params.clientId).done((client)=> this.setState({client}));
	},
	render: function(){
		if(! this.state.client){
			return <Loading/>;
		}
		var editLink = `/client/${this.props.params.clientId}/edit`;
		var clientLogo = this.state.client.logo_url ? <img style={{"padding":"10px"}} className="img-responsive" src={this.state.client.logo_url}/> : "";
		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li className="active"><King/> {this.state.client.name}</li>
				</ol>
				<div className="row">
				<div className="col-md-4">
				<div className="panel panel-primary">
					<div className="panel-heading">
						<Link to={editLink} className="btn btn-default btn-sm pull-right"><Pencil/></Link>
						<h4>
							<King/> Client Info
						</h4>
					</div>
					{clientLogo}
					<table className="table table-striped">
						<tbody>
							<tr><td className="text-right">Name</td><td><b>{ this.state.client.name }</b></td></tr>
							<tr><td className="text-right">Email</td><td><b>{ this.state.client.email }</b></td></tr>
							<tr><td className="text-right">Phone</td><td><b>{ this.state.client.phone }</b></td></tr>
						</tbody>
					</table>
				</div>
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
