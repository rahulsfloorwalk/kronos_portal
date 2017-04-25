import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { getAuditorStats } from '../../manager/service/auditor_stats.js';

import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';
import { King, Retweet, Inbox, Tasks, Pencil, File } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AuditReportStats = React.createClass({

  getInitialState: function(){
    return {};
  },
	componentDidMount: function(){
    getAuditorStats(this.props.params.auditorId).then((stats)=> this.setState({
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
    let audit_store_arr = this.state.stats.audit_store.map((row) => {
      let linkTo = `audit_store/${row.id}/report`
      return (
        <tr key={row.id} onClick={() => hashHistory.push(linkTo)} style={{cursor:'pointer'}}>
          <td>{row.client}</td>
          <td>{row.store}</td>
          <td>{row.audit_cycle}</td>
          <td>{row.date}</td>
          <td><AuditStoreStatusLabel status={row.status} /></td>
        </tr>
      );
    });

		return (
			<div className="row">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h4 className="panel-title">Audit Report Summary</h4>
          </div>
          <table className="table table-striped table-hover">
            <tbody>
              <tr>
                <th>Client</th>
                <th>Store</th>
                <th>Audit Cycle</th>
                <th>Audit Date</th>
                <th>Status</th>
              </tr>
              {audit_store_arr}
            </tbody>
          </table>
        </div>
			</div>
		);
	},
});

export default AuditReportStats;
