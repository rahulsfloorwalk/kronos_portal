import React, { Component } from "react";
import { hashHistory } from "react-router";

import { getDashboardAuditCycles } from "../service/dashboard_audit_cycles.js";

import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import ApplicationStatusLabel from "../../components/ApplicationStatusLabel.jsx";

import { getAuditStatus } from "../../utils.js";

import Loading from "../../components/Loading.jsx";

export default class AuditCycleDashBoard extends Component{
	constructor(props){
		super(props);
		this.state = {};
	}
	componentDidMount(){
		getDashboardAuditCycles().then((active_cycles)=> this.setState({
			active_cycles
		}));
	}
	render(){
		if(! this.state.active_cycles){
			return <Loading/>;
		}
		let audit_cycle_blocks = this.state.active_cycles.map((value) => {
			let linkTo = `/audit_cycle/${value.id}/questionnaire`;
			return (
				<tr key={value.id} onClick={()=> hashHistory.push(linkTo)} style={{cursor:"pointer"}} title="Click to open Audit Cycle">
					<td className="">
						<small>
							<b>{value.name}</b><br/>
							<b>{value.client}</b> - {getAuditStatus(value.status)}</small>
					</td>
					<td className="text-right"><b>{value.stats.application.APPLIED || ""}</b></td>
					<td className="text-right"><b>{value.stats.application.WAITLISTED || ""}</b></td>
					<td className="text-right"><b>{value.stats.application.APPROVED || ""}</b></td>
					<td className="text-right"><b>{value.stats.audit_store.ASSIGNED || ""}</b></td>
					<td className="text-right"><b>{value.stats.audit_store.ACKNOWLEDGED || ""}</b></td>
					<td className="text-right"><b>{value.stats.audit_store.SUBMITTED || ""}</b></td>
					<td className="text-right"><b>{value.stats.audit_store.PM_REVIEW || ""}</b></td>
					<td className="text-right"><b>{value.stats.audit_store.COMPLETED || ""}</b></td>
					<td className="text-right"><b>{value.stats.audit_store.ACCEPTED || ""}</b></td>
					<td className="text-right"><b>{value.audit_count}</b></td>
				</tr>
			);
		});
		return (
			<div className="table-responsive" style={{ maxHeight: "580px", overflowY: "auto" }}>
				<table className="table table-hover table-striped table-bordered table-condensed">
					<thead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff" }}>
						<tr>
							<th rowSpan="2">Client</th>
							<th colSpan="3" className="text-center">Application Status</th>
							<th colSpan="6" className="text-center">Report Status</th>
							<th rowSpan="2" className="text-right">Planned Audits</th>
						</tr>
						<tr>
							<th className="text-right"><ApplicationStatusLabel status={"APPLIED"}/></th>
							<th className="text-right"><ApplicationStatusLabel status={"WAITLISTED"}/></th>
							<th className="text-right"><ApplicationStatusLabel status={"APPROVED"}/></th>
							<th className="text-right"><AuditStoreStatusLabel status={"ASSIGNED"}/></th>
							<th className="text-right"><AuditStoreStatusLabel status={"ACKNOWLEDGED"}/></th>
							<th className="text-right"><AuditStoreStatusLabel status={"SUBMITTED"}/></th>
							<th className="text-right"><AuditStoreStatusLabel status={"PM_REVIEW"}/></th>
							<th className="text-right"><AuditStoreStatusLabel status={"COMPLETED"}/></th>
							<th className="text-right"><AuditStoreStatusLabel status={"ACCEPTED"}/></th>
						</tr>
					</thead>
					<tbody>
						{audit_cycle_blocks}
					</tbody>
				</table>
			</div>
		);
	}
}

