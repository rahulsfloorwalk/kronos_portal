import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { findReportsById } from "../../service/moderator.js";

import Modal from "../../../components/Modal.jsx";
import { pointerStyle }  from "../../../styles.js";
import moment from "moment";
import { momentDateFormat}  from "../../../../config.js";
import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";

class ModeratorReportRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		moderator_report: PropTypes.object,
	};

	render() {
		return (
			<tr key={this.props.moderator_report.id} style={pointerStyle} onClick={() => hashHistory.push(`/audit_store/${this.props.moderator_report.id}/report`)}>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.moderator_report.id}</td>
				<td>{this.props.moderator_report.audit.audit_cycle.client.name}</td>
				<td>{this.props.moderator_report.audit.store.name}, {this.props.moderator_report.audit.store.city.name}</td>
				<td>{this.props.moderator_report.earnings_per_audit}</td>
				<td>{this.props.moderator_report.reimbursement}</td>
				<td>{moment(this.props.moderator_report.audit_date).format(momentDateFormat)}</td>
				<td><AuditStoreStatusLabel status={this.props.moderator_report.status}/></td>
			</tr>
		);
	}
}



export default class ModeratorReportList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			userId: PropTypes.string,
		}),
	};

	state = {
		moderator_reports : []
	};


	componentDidMount() {
		console.log("componentDidMount")
		findReportsById(this.props.params.userId).then((moderator_reports) => {
			this.setState({
				moderator_reports
			});
		});
		
	}

	render() {
		var modalTitle = "Moderator Report List";
		var modalSize = "modal-lg"
		console.log(this.state.moderator_reports)
		const {moderator_reports} = this.state
		
		const rows = this.state.moderator_reports.map((m, i) => <ModeratorReportRow seq={i+1} moderator_report={m} key={m.id}/>);
		
		return (
			<Modal modalTitle={modalTitle} size={modalSize} onClose={hashHistory.goBack}>
				<table className="table table-bordered table-hover table-striped">
					<thead>
						<tr>
							<th>Sr No.</th>
							<th>Report Id</th>
							<th>Client</th>
							<th>Store</th>
							<th>Fees</th>
							<th>Reimbursement</th>
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
