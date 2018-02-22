import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Loading from '../../../components/Loading.jsx'
import { Check, Cross, Pencil, Plus, Bishop } from '../../../components/Icons.jsx'

import { fetchClientUsers } from '../../service/client_user.js'

var ClientUserRow = React.createClass({
	render: function(){
		let is_active = this.props.clientUser.user.is_active ? <Check/> : <Cross/>;
		let isClientAdmin = this.props.clientUser.is_client_admin ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{this.props.clientUser.full_name}</td>
				<td>{this.props.clientUser.user.email}</td>
				<td>{isClientAdmin}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/client/${this.props.clientUser.client}/client_user/${this.props.clientUser.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		fetchClientUsers(this.props.params.clientId).done((clientUsers)=>this.setState({clientUsers}));
	},
	componentWillReceiveProps: function(nextProps) {
		fetchClientUsers(nextProps.params.clientId).done((clientUsers)=>this.setState({clientUsers}));
	},
	render: function(){
		if(! this.state.clientUsers){
			return <Loading/>;
		}

		let rows = [];
		for(let cu of this.state.clientUsers) {
			rows.push(<ClientUserRow clientUser={cu} key={cu.id}/>);
		}
		let addClientUserLink = `/client/${this.props.params.clientId}/client_user/add`;
		return (
			<div>
				<h3 className="page-header">
					<Link to={addClientUserLink} className="btn btn-default pull-right"><Plus/> Add User</Link>
					<Bishop/> Client Users
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Full Name</th>
							<th>Email Address</th>
							<th>Client Admin</th>
							<th>Active</th>
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
