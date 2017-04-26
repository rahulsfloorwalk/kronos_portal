import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { getAuditorApplications } from '../../manager/service/auditor_stats.js';

import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';
import { King, Retweet, Inbox, Tasks, Pencil, File } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AuditorApplicationStats = React.createClass({

  getInitialState: function(){
    return {};
  },
	componentDidMount: function(){
    getAuditorApplications(this.props.params.auditorId).then((stats)=> this.setState({
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
    let appl_arr = this.state.stats.map((row) => {
      let linkTo = `audit_cycle/${row.audit__audit_cycle__id}/audit`
      return (
        <tr key={row.id} onClick={() => hashHistory.push(linkTo)} style={{cursor:'pointer'}}>
          <td>{row.audit__audit_cycle__client__name}</td>
          <td>{row.audit__store__name}</td>
          <td>{row.audit__audit_cycle__name}</td>
          <td>{row.audit_date}</td>
          <td><ApplicationStatusLabel status={row.status} /></td>
        </tr>
      );
    });

		return (
			<div className="row">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h4 className="panel-title">Application Summary</h4>
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
              {appl_arr}
            </tbody>
          </table>
        </div>
			</div>
		);
	},
});

export default AuditorApplicationStats;
