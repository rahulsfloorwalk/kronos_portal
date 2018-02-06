import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import { truncateStyle } from "../../styles.js";

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditCycle } from '../../manager/actions/audit.js';
import { getDashboardAuditCycles } from '../../manager/service/dashboard_audit_cycles.js';

import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';

import { getAuditStatus } from '../../utils.js';

import { King, Retweet, Inbox, Tasks, Pencil, File } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
// import Jumbotron from '../Jumbotron.jsx'
import Loading from '../Loading.jsx';

var AuditCycleDashBoard = React.createClass({

  getInitialState: function(){
    return {
    };
  },
	componentDidMount: function(){
    getDashboardAuditCycles().then((active_cycles)=> this.setState({
			active_cycles
		}));
	},
	componentWillReceiveProps(nextProps){
		console.log("AuditCycleSummary#componentWillReceiveProps#nextProps", nextProps);
	},
	render: function(){
		if(! this.state.active_cycles){
			return <Loading/>;
		}
    let audit_cycle_blocks = this.state.active_cycles.map((value) => {
      let linkTo = `/audit_cycle/${value.id}/questionnaire`
      return (
          <tr key={value.id} onClick={()=> hashHistory.push(linkTo)} style={{cursor:'pointer'}} title="Click to open Audit Cycle">
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
					      <th rowSpan="2">Client</th>
					      <th colSpan="3" className="text-center">Application Status</th>
					      <th colSpan="5" className="text-center">Report Status</th>
					      <th rowSpan="2" className="text-right">Planned Audits</th>
					</tr>
					<tr>
					      <th className="text-right"><ApplicationStatusLabel status={"APPLIED"}/></th>
					      <th className="text-right"><ApplicationStatusLabel status={"WAITLISTED"}/></th>
					      <th className="text-right"><ApplicationStatusLabel status={"APPROVED"}/></th>
					      <th className="text-right"><AuditStoreStatusLabel status={"ASSIGNED"}/></th>
					      <th className="text-right"><AuditStoreStatusLabel status={"ACKNOWLEDGED"}/></th>
					      <th className="text-right"><AuditStoreStatusLabel status={"SUBMITTED"}/></th>
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
	},
});

export default AuditCycleDashBoard;
