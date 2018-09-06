import React from "react";
import { } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";
import { File } from "../../../components/Icons.jsx";

import PostApprovalDescriptionRenderer from "./PostApprovalDescriptionRenderer.jsx";

import { auditStorePropType } from "../../prop_types.js";

export default class AuditStoreDetails extends React.Component {
	static propTypes = {
		auditStore: auditStorePropType.isRequired,
	};

	render() {
		const earnings_per_audit = this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit;
		const fees = earnings_per_audit ? <b>Fees: ₹ {earnings_per_audit}, </b> : "";
		const reimbursement = this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement;
		const reimb = reimbursement ? <span>Reimbursement upto: <b>₹ {reimbursement}</b></span> : "";

		return (
			<div>
				<h2 className="page-header"><File/> Audit Report - <b>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b></h2>
				<div className="row">
					<div className="col-md-12">
						<div className="panel panel-default">
							<table className="table table-striped">
								<tbody>
									<tr>
										<td className="text-right">Store:</td>
										<th>{this.props.auditStore.audit.store.name}</th>
									</tr>
									<tr>
										<td className="text-right">Phone:</td>
										<th>{this.props.auditStore.audit.store.phone}</th>
									</tr>
									<tr>
										<td className="text-right">Address:</td>
										<th>{this.props.auditStore.audit.store.address}</th>
									</tr>
									<tr>
										<td className="text-right">Fees:</td>
										<th>{fees}{reimb}</th>
									</tr>
									<tr>
										<td className="text-right">Audit Date:</td>
										<th>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</th>
									</tr>
									<tr>
										<td className="text-right">Status:</td>
										<th><AuditStoreStatusLabel status={this.props.auditStore.status}/></th>
									</tr>
								</tbody>
							</table>
							<PostApprovalDescriptionRenderer audit={this.props.auditStore.audit}/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
