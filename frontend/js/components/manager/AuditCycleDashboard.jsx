import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditCycle } from '../../manager/actions/audit.js';
import { getDashboardAuditCycles } from '../../manager/service/dashboard_audit_cycles.js';

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
          <div className="col-md-4" onClick={()=> hashHistory.push(linkTo)} style={{cursor:'pointer'}}>
            <div className="well well-sm">
              <h4 className="heading">{value.name}
              </h4>
              <hr/>
              <p>Client: <b>{value.client.name}</b></p>
              <p>Current Status: {value.status}</p>
              <p>Start Date: {value.start_date}</p>
              <p>End Date: {value.end_date}</p>
              <AuditCycleSummary auditCycleId={value.id} />
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
