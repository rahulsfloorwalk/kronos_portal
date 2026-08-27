import React from "react";
import PropTypes from "prop-types";
import { hashHistory, Link } from "react-router";
import moment from "moment";

import { findModeratorDetailsById } from "../../service/moderator.js";
import { momentDateFormat } from "../../../../config.js";

import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";

const getAssignedModerator = (auditStore, moderatorId) => {
	const assigned = auditStore.assigned_to_moderator || [];
	return assigned.find(m => m.id === parseInt(moderatorId)) || assigned[0];
};

const renderModeratorDisplay = (moderator) => {
	if(!moderator) return null;
	if(!moderator.name) return <span>{moderator.email}</span>;
	return (<span>{moderator.name}<br/>({moderator.email})</span>);
};

class AuditCycleModeratorReportRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		auditStore: PropTypes.object.isRequired,
		moderator: PropTypes.object,
	};

	render() {
		const { seq, auditStore, moderator } = this.props;
		return (
			<tr key={auditStore.id}>
				<td>{seq}</td>
				<td>{auditStore.id}</td>
				<td>{auditStore.audit.store.name}, {auditStore.audit.store.city.name}</td>
				<td>{renderModeratorDisplay(moderator)}</td>
				<td>{moment(auditStore.audit_date).format(momentDateFormat)}</td>
				<td><AuditStoreStatusLabel status={auditStore.status}/></td>
				<td><Link className="btn btn-primary btn-md" to={`/audit_store/${auditStore.id}/report`} target="_blank" rel="noopener noreferrer">View</Link></td>
			</tr>
		);
	}
}

export default class AuditCycleModeratorReportListModal extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
			moderatorId: PropTypes.string.isRequired,
		}).isRequired,
	};

	state = {
		auditStores: null,
	};

	componentDidMount() {
		const { auditCycleId, moderatorId } = this.props.params;
		findModeratorDetailsById(auditCycleId, moderatorId).then((auditStores) => {
			this.setState({ auditStores });
		});
	}

	render() {
		if(!this.state.auditStores) {
			return (
				<Modal modalTitle="Moderator Report List" size="modal-lg" onClose={hashHistory.goBack}>
					<Loading/>
				</Modal>
			);
		}

		const { auditStores } = this.state;
		const { moderatorId } = this.props.params;
		const headerModerator = auditStores.length ? getAssignedModerator(auditStores[0], moderatorId) : null;
		const cycleName = auditStores.length ? auditStores[0].audit.audit_cycle.name : "";

		const rows = auditStores.map((auditStore, i) => (
			<AuditCycleModeratorReportRow
				key={auditStore.id}
				seq={i + 1}
				auditStore={auditStore}
				moderator={getAssignedModerator(auditStore, moderatorId)}
			/>
		));

		return (
			<Modal modalTitle="Moderator Report List" size="modal-lg" onClose={hashHistory.goBack}>
				<h4>
					{headerModerator.name ? `${headerModerator.name}` : `${headerModerator.email}`}
					{cycleName ? ` -- ${cycleName}` : ""}
				</h4>
				<table className="table table-bordered table-hover table-striped">
					<thead>
						<tr>
							<th>Sr No.</th>
							<th>Report Id</th>
							<th>Store</th>
							<th>Assigned To</th>
							<th>Audit Date</th>
							<th>Report Status</th>
							<th></th>
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