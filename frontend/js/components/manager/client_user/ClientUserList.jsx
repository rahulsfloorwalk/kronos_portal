import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { Check, Cross, Pencil, Plus, User } from '../../Icons.jsx'

import { fetchClientUsers } from '../../../manager/actions/client_user.js'

var ClientUserRow = React.createClass({
	render: function(){
		var is_active = this.props.clientUser.user.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{this.props.clientUser.full_name}</td>
				<td>{this.props.clientUser.user.email}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/client/${this.props.clientUser.client}/client_user/${this.props.clientUser.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	},
});

var ClientUserList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchClientUsers(this.props.params.clientId));
	},
	render: function(){
		var rows = [];
		for(var id in this.props.clientUsers) {
			rows.push(<ClientUserRow clientUser={this.props.clientUsers[id]} key={id}/>);
		}
		var addClientUserLink = `/client/${this.props.params.clientId}/client_user/add`;
		return (
			<div>
				<h3 className="page-header">
					<Link to={addClientUserLink} className="btn btn-default pull-right"><Plus/> Add User</Link>
					<User/> Client Users
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Full Name</th>
							<th>Email Address</th>
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

var mapStoreToProps = function(store, ownProps){
	return {
		clientUsers: store.clientUsers
	};
};

export default ReactRedux.connect(mapStoreToProps)(ClientUserList);
