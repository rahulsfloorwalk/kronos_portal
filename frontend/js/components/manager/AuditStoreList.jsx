import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat, url}  from '../../../config.js';

import { File, Download } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';

import {fetchAuditStores} from '../../manager/actions/audit_store.js';
import { getAuditStoreStatus } from '../../utils.js';

var AuditStoreRow = React.createClass({
  render: function(){
    let auditorUrl = `/auditor/${this.props.auditStore.user.id}`;
    let auditorLink = (<Link to={auditorUrl}>{this.props.auditStore.user.profileinfo.first_name} {this.props.auditStore.user.profileinfo.last_name}</Link>);
    let auditorPhoneLink = (<a href={`tel:${this.props.auditStore.user.profileinfo.mobile_number}`}>{this.props.auditStore.user.profileinfo.mobile_number}</a>);
    return(
      <tr>
        <td><b>{auditorLink}</b> ( {auditorPhoneLink})</td>
        <td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
        <td><AuditStoreStatusLabel status={this.props.auditStore.status}/></td>
        <td>
          <Link to={`/audit_store/${this.props.auditStore.id}/report`} className="btn btn-default">View</Link>
        </td>
      </tr>
    );
  },
});

var AuditStoreTable = React.createClass({
  render: function(){
    let reps = [];
    for(let n in this.props.auditStores){
      reps.push(<AuditStoreRow auditStore={this.props.auditStores[n]} key={n} />);
    }
    return(
	<table className="table table-striped">
	  <thead>
	    <tr>
	      <th>Auditor Name</th>
	      <th>Audit Date</th>
	      <th>Report Status</th>
	      <th></th>
	    </tr>
	  </thead>
	  <tbody>
	    {reps}
	  </tbody>
	</table>
    );
  },
});

var AuditStoreList = React.createClass({
  componentDidMount: function(){
    this.props.dispatch(fetchAuditStores(this.props.params.auditCycleId));
  },
  render: function(){
		var audits = [];
		for(var id in this.props.auditStores) {
			let audit = audits.filter((a)=> a.id === this.props.auditStores[id].audit.id)[0];
			if(! audit){
				audits.push(this.props.auditStores[id].audit);
				audit = audits.filter((a)=> a.id === this.props.auditStores[id].audit.id)[0];
				audit.reports = [];
			}
			audit.reports.push(this.props.auditStores[id]);
		}
		console.log("unique audits:",audits);
    var rows = [];
    for( var i in audits){
	    rows.push(
		    <div className="panel panel-default" key={audits[i].id}>
			<div className="panel-heading">
				{audits[i].store.location.name}, {audits[i].store.location.city.name}
			</div>
			<AuditStoreTable auditStores={audits[i].reports}/>
		    </div>
	    );
    }
    return(
      <div>
        <h3 className="page-header">
          <File/> Reports
          <a className="btn btn-default pull-right" href={url.api_base_path + 'manager/audit_cycle/' + this.props.params.auditCycleId + '/audit_cycle_xlsx_report'}>
              <Download/> Excel Report
          </a>
        </h3>
	    {rows}
        {this.props.children}
      </div>
    );
  },
});

var mapStoreToProps = function(store, ownProps){
  return{
    auditStores: store.auditStores
  };
}
export default ReactRedux.connect(mapStoreToProps)(AuditStoreList);

export { AuditStoreTable };
