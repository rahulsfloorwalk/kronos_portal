import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditCycle } from '../../manager/actions/audit.js';
import { getDashboardAuditCycles } from '../../manager/service/dashboard_audit_cycles.js';

import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';

import { getAuditStatus } from '../../utils.js';

import AuditCycleSummary from './AuditCycleSummary.jsx'
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
          <div className="col-md-4">
          <div className="panel panel-default" onClick={()=> hashHistory.push(linkTo)} style={{cursor:'pointer'}}>
            <div className="panel-heading">
              <h4 className="panel-title"><b>{value.name}</b></h4>
            </div>
            <table className="table">
              <tbody>
                <tr key="status"><td style={{width:"50%"}} className="text-right"><b>STATUS</b></td><td><b>{getAuditStatus(value.status)}</b></td></tr>
                <tr key={"ASSIGNED"}><td style={{width:"50%"}} className="text-right"><AuditStoreStatusLabel status= {"ASSIGNED"}/></td><td><b>{value.stats.audit_store.ASSIGNED}</b></td></tr>
                <tr key={"SUBMITTED"}><td style={{width:"50%"}} className="text-right"><AuditStoreStatusLabel status= {"SUBMITTED"}/></td><td><b>{value.stats.audit_store.SUBMITTED}</b></td></tr>
                <tr key={"COMPLETED"}><td style={{width:"50%"}} className="text-right"><AuditStoreStatusLabel status= {"COMPLETED"}/></td><td><b>{value.stats.audit_store.COMPLETED}</b></td></tr>
              </tbody>
            </table>
          </div>
          </div>
      );
    });
		return (
      <div className="container">
  			<div className="row">
          {audit_cycle_blocks}
  			</div>
      </div>
		);
	},
});

export default AuditCycleDashBoard;
