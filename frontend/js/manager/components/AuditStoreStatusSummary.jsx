import React, { Component } from "react";
import PropTypes from "prop-types";

import { fetchAuditStoreStats } from "../service/audit_cycle_stats.js";

import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import Loading from "../../components/Loading.jsx";

export default class AuditStoreStatusSummary extends Component{
	static propTypes = {
		auditCycleId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	};
	constructor(props){
		super(props);
		this.state = {};
	}
	componentDidMount(){
		fetchAuditStoreStats(this.props.auditCycleId).then((stats)=> this.setState({ stats }));
	}
	render(){
		if(! this.state.stats){
			return <Loading/>;
		}
		return (
			<table className="table table-bordered">
				<thead>
					<tr>
						{
							["ASSIGNED", "ACKNOWLEDGED", "WITHDRAWN", "AUDITOR_WITHDRAWN", "FAILED", "SUBMITTED", "PM_REVIEW", "COMPLETED", "ACCEPTED", "REJECTED"].map((status) => {
								return (
									<td key={status} className="text-center">
										<AuditStoreStatusLabel status={status}/>
									</td>
								);
							})
						}
					</tr>
				</thead>
				<tbody>
					<tr>
						{
							["ASSIGNED", "ACKNOWLEDGED", "WITHDRAWN", "AUDITOR_WITHDRAWN", "FAILED", "SUBMITTED", "PM_REVIEW", "COMPLETED", "ACCEPTED", "REJECTED"].map((status) => {
								let item = this.state.stats.find( s => s.status === status);
								return (
									<td key={status} className="text-center">
										<b>{item ? item.count : null}</b>
									</td>
								);
							})
						}
					</tr>
				</tbody>
			</table>
		);
	}
}

