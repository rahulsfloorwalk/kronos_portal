import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../../components/Loading.jsx";
import { Check, Cross, Pencil, Plus, Knight } from "../../../components/Icons.jsx";

import {  fetchClientModerators } from "../../service/client_manager.js";

class ClientModeratorRow extends React.Component {
	static propTypes = {
		clientModerator: PropTypes.shape({
			id: PropTypes.number,
			is_active: PropTypes.bool,
			receive_email_notification: PropTypes.bool ,
			client: PropTypes.number,
			user: PropTypes.shape({
				email: PropTypes.string,
			}),
		}),
	};
	render() {
		let is_active = this.props.clientModerator.is_active ? <Check/> : <Cross/>;
		let receive_email_notification = this.props.clientModerator.receive_email_notification ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{this.props.clientModerator.user.email}</td>
				<td>{receive_email_notification}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/client/${this.props.clientModerator.client}/client_qa_listing/${this.props.clientModerator.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	}
}

export default class ClientQaList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		params: PropTypes.shape({
			clientId: PropTypes.number,
		}),
	};
	state = {};

	componentDidMount() {
		fetchClientModerators(this.props.params.clientId).done((clientModerators)=>this.setState({clientModerators}));
	}

	componentWillReceiveProps(nextProps) {
		fetchClientModerators(nextProps.params.clientId).done((clientModerators)=>this.setState({clientModerators}));
	}

	render() {
		if(! this.state.clientModerators){
			return <Loading/>;
		}

		let rows = this.state.clientModerators.slice().sort((a, b) => b.id - a.id).map(cm => <ClientModeratorRow key={cm.id} clientModerator={cm} />);
		let addClientUserLink = `/client/${this.props.params.clientId}/client_qa_listing/add`;
		return (
			<div className="table-responsive">
				<h3 className="page-header">
					<Link to={addClientUserLink} className="btn btn-default pull-right"><Plus/> Add QAs</Link>
					<Knight/> QA Listing
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Email Address</th>
							<th>Receive Email</th>
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