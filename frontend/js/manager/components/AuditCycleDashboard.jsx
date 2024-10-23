import React, { Component } from "react";
import { hashHistory } from "react-router";

import { getDashboardAuditCycles,getDashboardClientAuditCycles,getDashboardAuditCyclesdropdown } from "../service/dashboard_audit_cycles.js";

import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import ApplicationStatusLabel from "../../components/ApplicationStatusLabel.jsx";

import { getAuditStatus } from "../../utils.js";

import Loading from "../../components/Loading.jsx";

export default class AuditCycleDashBoard extends Component{
	constructor(props){
		super(props);
		this.state = {
			active_cycles: null,
			selectedClientState:"",
			client_dropdown:[],
		};
	}
	componentDidMount(){
		getDashboardAuditCycles().then((active_cycles)=> this.setState({
			active_cycles
		}));
		getDashboardAuditCyclesdropdown().then((client_dropdown)=> this.setState({
			client_dropdown
		}));
	}

	onClientChange = (e) => {
		const client_id = e.target.value;
		const status = this.state.selectedStatus;

		this.setState({ selectedClientState: client_id });

		if (client_id) {
			getDashboardClientAuditCycles(client_id, status).then((client_cycles) =>
				this.setState({ active_cycles: client_cycles })
			);
		} else {
			getDashboardAuditCycles().then((active_cycles) =>
				this.setState({ active_cycles })
			);
		}
	};

	onApplicationStatusChange = (e) => {
		const status = e.target.value;
		const client_id = this.state.selectedClientState;

		this.setState({ selectedStatus: status });
		if (client_id) {
			getDashboardClientAuditCycles(client_id, status).then((client_cycles) =>
				this.setState({ active_cycles: client_cycles })
			);
		} else {
			getDashboardClientAuditCycles(client_id, status).then((client_cycles) =>
				this.setState({ active_cycles: client_cycles })
			);
		}
	};

	render(){
		if(! this.state.active_cycles){
			return <Loading/>;
		}
		const applied=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.application.APPLIED;
		},0);
		const waitlisted=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.application.WAITLISTED;
		},0);
		const approved=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.application.APPROVED;
		},0);
		const assigned=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.audit_store.ASSIGNED;
		},0);
		const acknowledged=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.audit_store.ACKNOWLEDGED;
		},0);
		const sumbitted=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.audit_store.SUBMITTED;
		},0);
		const pm_review=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.audit_store.PM_REVIEW;
		},0);
		const completed=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.audit_store.COMPLETED;
		},0);
		const accepted=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.stats.audit_store.ACCEPTED;
		},0);
		const audit_count=this.state.active_cycles.reduce((acc,curr)=>{
			return acc=acc+curr.audit_count;
		},0);
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
		// const clientOptions = [...new Set(this.state.client_dropdown.map(client => (
		// 	<option key={client.id} value={client.id}>{client.name}</option>
		// )))];
		const clientOptions = this.state.client_dropdown.length > 0? this.state.client_dropdown.map(client => (
			<option key={client.id} value={client.id}>{client.name}</option>
		))
			: <option disabled>No clients available</option>;
		return (
			<div className="table-responsive" style={{ maxHeight: "580px", overflowY: "auto" }}>
				<select onChange={this.onClientChange} className="" style={{ width: "15rem", padding: "0.5rem", marginLeft: "78%", marginRight: "1rem", marginBottom: "1rem"}}>
					<option value="">All Clients</option>
					{clientOptions}
				</select>
				<select onChange={this.onApplicationStatusChange} className="" style={{ width: "15rem", padding: "0.5rem" }}>
					<option value="">All Status</option>
					<option value="UPCOMING">Upcoming</option>
					<option value="ACTIVE">Active</option>
					<option value="REPORT">Report</option>
					<option value="CLEARING">Clearing</option>
				</select>

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
						<tr>
							<td><strong>Total</strong></td>
							<td className="text-right"><strong>{applied}</strong></td>
							<td className="text-right"><strong>{waitlisted}</strong></td>
							<td className="text-right"><strong>{approved}</strong></td>
							<td className="text-right"><strong>{assigned}</strong></td>
							<td className="text-right"><strong>{acknowledged}</strong></td>
							<td className="text-right"><strong>{sumbitted}</strong></td>
							<td className="text-right"><strong>{pm_review}</strong></td>
							<td className="text-right"><strong>{completed}</strong></td>
							<td className="text-right"><strong>{accepted}</strong></td>
							<td className="text-right"><strong>{audit_count}</strong></td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}

