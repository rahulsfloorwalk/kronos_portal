import React, { Component } from 'react';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditStoreStats } from '../service/audit_cycle_stats.js';

import AuditStoreStatusLabel from '../../components/AuditStoreStatusLabel.jsx';
import ApplicationStatusLabel from '../../components/ApplicationStatusLabel.jsx';
import ExpandableDetails from '../../components/ExpandableDetails.jsx';
import { King, Retweet, Inbox, Tasks, Pencil, File } from '../../components/Icons.jsx';
import NavLink from '../../components/NavLink.jsx';
import Panel from '../../components/Panel.jsx';
import Loading from '../../components/Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

export default class AuditStoreStatusSummary extends Component{
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
				["ASSIGNED", "ACKNOWLEDGED", "WITHDRAWN", "FAILED", "SUBMITTED", "PM_REVIEW", "COMPLETED", "ACCEPTED", "REJECTED"].map((status) => {
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
				["ASSIGNED", "ACKNOWLEDGED", "WITHDRAWN", "FAILED", "SUBMITTED", "PM_REVIEW", "COMPLETED", "ACCEPTED", "REJECTED"].map((status) => {
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

