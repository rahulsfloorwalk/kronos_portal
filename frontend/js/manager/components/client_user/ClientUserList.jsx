import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../../components/Loading.jsx";
import { Check, Cross, Pencil, Plus, Bishop, MapMarker } from "../../../components/Icons.jsx";

import { fetchClientUsers } from "../../service/client_user.js";

class ClientUserRow extends React.Component {
	static propTypes = {
		clientUser: PropTypes.shape({
			id: PropTypes.number,
			full_name: PropTypes.string,
			is_client_admin: PropTypes.bool,
			client: PropTypes.shape({
			}),
			user: PropTypes.shape({
				email: PropTypes.string,
				is_active: PropTypes.bool,
			}),
		}),
	};
	render() {
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
					&nbsp;
					{!this.props.clientUser.is_client_admin ?
						<Link to={`/client/${this.props.clientUser.client}/client_user/${this.props.clientUser.id}/assign_stores`} className="btn btn-default"><MapMarker/></Link>
						: null
					}
				</td>
			</tr>
		);
	}
}

export default class ClientUserList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		params: PropTypes.shape({
			clientId: PropTypes.number,
		}),
	};
	state = {};

	componentDidMount() {
		fetchClientUsers(this.props.params.clientId).done((clientUsers)=>this.setState({clientUsers}));
	}

	componentWillReceiveProps(nextProps) {
		fetchClientUsers(nextProps.params.clientId).done((clientUsers)=>this.setState({clientUsers}));
	}

	render() {
		if(! this.state.clientUsers){
			return <Loading/>;
		}

		let rows = [];
		for(let cu of this.state.clientUsers) {
			rows.push(<ClientUserRow clientUser={cu} key={cu.id}/>);
		}
		let addClientUserLink = `/client/${this.props.params.clientId}/client_user/add`;
		return (
			<div className="table-responsive">
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
	}
}
