import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditCycle } from '../../manager/actions/audit.js';
import { getAuditCycleStats } from '../../manager/service/audit_cycle_stats.js';

import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';
import ExpandableDetails from '../ExpandableDetails.jsx';
import { King, Retweet, Inbox, Tasks, Pencil, File } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AuditCycleSummary = React.createClass({

  getInitialState: function(){
    return {};
  },
	componentDidMount: function(){
    getAuditCycleStats(this.props.auditCycleId).then((stats)=> this.setState({
			stats
		}));
	},
	componentWillReceiveProps(nextProps){
		console.log("AuditCycleDetails#componentWillReceiveProps#nextProps", nextProps);
	},
	render: function(){
		if(! this.state.stats){
			return <Loading/>;
		}
    let appl_arr = ["APPLIED", "REJECTED", "APPROVED"].map((status) => {
      return (<tr key={status}><td style={{width:"50%"}} className="text-right"><ApplicationStatusLabel status={status} /></td><td><b>{this.state.stats.application[status]}</b></td></tr>);
    });
    let audit_store_arr = ["ASSIGNED", "WITHDRAWN", "FAILED", "SUBMITTED", "COMPLETED", "ACCEPTED", "REJECTED"].map((status) => {
      return (<tr key={status}><td style={{width:"50%"}} className="text-right"><AuditStoreStatusLabel status= {status}/></td><td><b>{this.state.stats.audit_store[status]}</b></td></tr>);
    });
		return (
      <div>
  			<div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h4 className="panel-title">Application Summary</h4>
            </div>
            <table className="table table-striped">
              <tbody>
                {appl_arr}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h4 className="panel-title">Audit Report Summary</h4>
            </div>
            <table className="table table-striped">
              <tbody>
                {audit_store_arr}
              </tbody>
            </table>
          </div>
  			</div>
      </div>
		);
	},
});

export default AuditCycleSummary;
