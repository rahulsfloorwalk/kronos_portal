import React from "react";
import PropTypes from "prop-types";
import { hashHistory, Link } from "react-router";

import { findReportsById } from "../../service/moderator.js";

import Modal from "../../../components/Modal.jsx";
import moment from "moment";
import { momentDateFormat } from "../../../../config.js";
import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";
import { findTrainers } from "../../service/trainer.js";

class TrainerReportRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		auditStore: PropTypes.object,

		trainers: PropTypes.array,
		onUpdate: PropTypes.func
	};

	render() {
		return (

			<tr key={this.props.auditStore.id}>
				<td className="text-right">{this.props.seq}</td>
				<td><Link to={`/audit_store/${this.props.auditStore.id}/report`}>{this.props.auditStore.id}</Link></td>
				<td>{this.props.auditStore.audit.audit_cycle.client.name}</td>
				<td>{this.props.auditStore.audit.store.name}, {this.props.auditStore.audit.store.city.name}</td>
				{/* <td><ModeratorAssignDropdown moderators={this.props.moderators} selectedModeratorId={this.props.auditStore.assigned_to_moderator} auditStoreId={this.props.auditStore.id} onUpdate={this.props.onUpdate}/></td> */}
				<td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
				<td><AuditStoreStatusLabel status={this.props.auditStore.status} /></td>
			</tr>
		);
	}
}



export default class TrainerReportList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			userId: PropTypes.string,
		}),
		moderators: PropTypes.array,
		onUpdate: PropTypes.func
	};

	state = {
		auditStore: [],
		trainers: []
	};


	componentDidMount() {
		findReportsById(this.props.params.userId).then((auditStore) => {
			this.setState({
				auditStore
			});
		});
		findTrainers().then((trainers) => {
			this.setState({ trainers });
		});
	}

	auditStoreUpdated = () => {
		findReportsById(this.props.params.userId).then((auditStore) => {
			this.setState({
				auditStore
			});
		});
	};

	render() {
		var modalTitle = "Moderator Report List";
		var modalSize = "modal-lg";

		const rows = this.state.auditStore.map((m, i) => <TrainerReportRow seq={i + 1} auditStore={m} trainers={this.state.trainers} onUpdate={this.auditStoreUpdated} key={m.id} />);

		return (
			<Modal modalTitle={modalTitle} size={modalSize} onClose={hashHistory.goBack}>
				<table className="table table-bordered table-hover table-striped">
					<thead>
						<tr>
							<th>Sr No.</th>
							<th>Report Id</th>
							<th>Client</th>
							<th>Store</th>
							<th>Assigned To</th>
							<th>Audit Date</th>
							<th>Report Status</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</Modal>
		);
	}
}