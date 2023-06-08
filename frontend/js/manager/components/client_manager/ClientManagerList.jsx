import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../../components/Loading.jsx";
import { Check, Cross, Pencil, Plus, Knight } from "../../../components/Icons.jsx";

import { fetchClientManagers } from "../../service/client_manager.js";

class ClientManagerRow extends React.Component {
	static propTypes = {
		clientManager: PropTypes.shape({
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
		let is_active = this.props.clientManager.is_active ? <Check/> : <Cross/>;
		let receive_email_notification = this.props.clientManager.receive_email_notification ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{this.props.clientManager.user.email}</td>
				<td>{receive_email_notification}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/client/${this.props.clientManager.client}/client_manager/${this.props.clientManager.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
				{/* <td>
					<Link to={`/client/${this.props.clientUser.client}/client_manager/${this.props.clientUser.id}/delete`} className="btn btn-default"><Cross/></Link>
				</td> */}
			</tr>
		);
	}
}

export default class ClientManagerList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		params: PropTypes.shape({
			clientId: PropTypes.number,
		}),
	};
	state = {};

	componentDidMount() {
		fetchClientManagers(this.props.params.clientId).done((clientManagers)=>this.setState({clientManagers}));
	}

	componentWillReceiveProps(nextProps) {
		fetchClientManagers(nextProps.params.clientId).done((clientManagers)=>this.setState({clientManagers}));
	}

	render() {
		if(! this.state.clientManagers){
			return <Loading/>;
		}

		let rows = [];
		for(let cm of this.state.clientManagers) {
			rows.push(<ClientManagerRow clientManager={cm} key={cm.id}/>);
		}
		let addClientUserLink = `/client/${this.props.params.clientId}/client_manager/add`;
		return (
			<div className="table-responsive">
				<h3 className="page-header">
					<Link to={addClientUserLink} className="btn btn-default pull-right"><Plus/> Add Manager</Link>
					<Knight/> Manager
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
