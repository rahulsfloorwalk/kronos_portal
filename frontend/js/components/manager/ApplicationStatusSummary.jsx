import React from 'react';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditCycle } from '../../manager/actions/audit.js';
import { fetchApplicationStats } from '../../manager/service/audit_cycle_stats.js';

import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';
import ExpandableDetails from '../ExpandableDetails.jsx';
import { King, Retweet, Inbox, Tasks, Pencil, File } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function(){
		this._promise = fetchApplicationStats(this.props.auditCycleId).done((stats) => this.setState({ stats }));
	},
	componentWillUnmount: function(){
		this._promise && this._promise.readyState !== 4 && this._promise.abort();
	},
	render: function(){
		if(! this.state.stats){
			return <Loading/>;
		}
		return (
			<table className="table table-bordered">
			<thead>
			<tr>
			{
				["APPLIED", "APPROVED", "REJECTED"].map((status) => {
					return (
					<td key={status} className="text-center">
						<ApplicationStatusLabel status={status} />
					</td>
					);
				})
			}
			</tr>
			</thead>
			<tbody>
			<tr>
			{
				["APPLIED", "APPROVED", "REJECTED"].map((status) => {
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
	},
});

