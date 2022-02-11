import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../../components/Loading.jsx";
import { Check, Cross, Pencil, Plus, Education } from "../../../components/Icons.jsx";

import { fetchClientTrainers } from "../../service/client_trainer.js";

class ClientTrainerRow extends React.Component {
	static propTypes = {
		clientTrainer: PropTypes.shape({
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
		let is_active = this.props.clientTrainer.is_active ? <Check/> : <Cross/>;
		let receive_email_notification = this.props.clientTrainer.receive_email_notification ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{this.props.clientTrainer.user.email}</td>
				<td>{receive_email_notification}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/client/${this.props.clientTrainer.client}/client_trainer/${this.props.clientTrainer.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	}
}

export default class ClientTrainerList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		params: PropTypes.shape({
			clientId: PropTypes.string,
		}),
	};
	state = {};

	componentDidMount() {
		fetchClientTrainers(this.props.params.clientId).done((clientTrainers)=>this.setState({clientTrainers}));
	}

	componentWillReceiveProps(nextProps) {
		fetchClientTrainers(nextProps.params.clientId).done((clientTrainers)=>this.setState({clientTrainers}));
	}

	render() {
		if(! this.state.clientTrainers){
			return <Loading/>;
		}

		let rows = [];
		for(let ct of this.state.clientTrainers) {
			rows.push(<ClientTrainerRow clientTrainer={ct} key={ct.id}/>);
		}
		let addClientUserLink = `/client/${this.props.params.clientId}/client_trainer/add`;
		return (
			<div>
				<h3 className="page-header">
					<Link to={addClientUserLink} className="btn btn-default pull-right"><Plus/> Add Trainer</Link>
					<Education/> Trainer
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
