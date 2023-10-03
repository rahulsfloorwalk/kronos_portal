import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { pointerStyle }  from "../../styles.js";

import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";

import { findByAuditCycleId } from "../service/audit_store.js";

import AuditorNameDisplay from "./AuditorNameDisplay.jsx";

class AuditStoreRow extends React.Component {
	static propTypes = {
		auditStore: PropTypes.shape({
			id: PropTypes.number.isRequired,
			status: PropTypes.string.isRequired,
			auto_assigned: PropTypes.boolean.isRequired,
			instant_assigned: PropTypes.boolean.isRequired,
			audit_date: PropTypes.string.isRequired,
			user: PropTypes.shape({
				profileinfo: PropTypes.shape({
				}),
				agencyuser: PropTypes.shape({
					full_name: PropTypes.string,
				}),
				mobile_numbers: PropTypes.arrayOf(PropTypes.shape({
					mobile_number: PropTypes.string.isRequired,
				})).isRequired,
			}),
			audit: PropTypes.shape({
				earnings_per_audit: PropTypes.number,
				reimbursement: PropTypes.number,
				store: PropTypes.shape({
					city: PropTypes.shape({
						name: PropTypes.string.isRequired,
					}),
				}),
			}),
		}),
	};
	render() {
		return(
			<tr style={pointerStyle} onClick={() => hashHistory.push(`/audit_store/${this.props.auditStore.id}/report`)}>
				<td><AuditorNameDisplay user={this.props.auditStore.user}/></td>
				<td className="text-right">{this.props.auditStore.audit.earnings_per_audit}</td>
				<td className="text-right">{this.props.auditStore.audit.reimbursement}</td>
				<td>{this.props.auditStore.audit.store.city.name}</td>
				<td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
				<td><AuditStoreStatusLabel status={this.props.auditStore.status}/></td>
			</tr>
		);
	}
}

export default class AuditStoreList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
	};

	state = {
		auditStores: []
	};
	componentDidMount() {
		findByAuditCycleId(this.props.params.auditCycleId).then((auditStores) => {
			this.setState({
				auditStores
			});
		});
	}
	render() {
		let reps = [];
		for(let as of this.state.auditStores){
			reps.push(<AuditStoreRow auditStore={as} key={as.id} />);
		}
		return(
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">Reports</h4>
				</div>
				<table className="table table-hover table-striped">
					<thead>
						<tr>
							<th>Auditor Name</th>
							<th className="text-right">Fees</th>
							<th className="text-right">Reimbursement</th>
							<th>City</th>
							<th>Audit Date</th>
							<th>Report Status</th>
						</tr>
					</thead>
					<tbody>
						{reps}
					</tbody>
				</table>
			</div>
		);
	}
}
