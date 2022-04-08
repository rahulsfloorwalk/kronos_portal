import React, { Component } from "react";

import { getDashboardAuditCycles } from "../../service/dashboard_audit_cycles.js";

import Loading from "../../../components/Loading.jsx";

export default class AuditCycleDashBoard extends Component{
	constructor(props){
		super(props);
		this.state = {
			active_cycles: [],
			loading: false
		};
	}
	componentDidMount(){
		this.setState({loading:true});
		getDashboardAuditCycles().then((active_cycles)=> this.setState({
			active_cycles,
			loading: false
		}));
	}
	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		let audit_cycle_blocks = this.state.active_cycles.map((value) => {
			return (
				<tr key={value.id}>
					<td className="">
						<small>
							<b>{value.name}</b><br/>
							<b>{value.client}</b> - </small>
					</td>
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
			<div className="table-responsive">
				<table className="table table-hover table-striped table-bordered table-condensed">
					<thead>
						<tr>
							<th></th>
							<th colSpan="8" className="text-center">Audit Status</th>
						</tr>
						<tr>
							<th className="text-left">Cycle Name</th>
							<th className="text-right">Assigned</th>
							<th className="text-right">In-Progress</th>
							<th className="text-right">QA Review</th>
							<th className="text-right">PM Review</th>
							<th className="text-right">Client Review</th>
							<th className="text-right">Accepted</th>
							<th className="text-right">Planned Audits</th>
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