import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat, url}  from '../../../config.js';

import Jumbotron from '../Jumbotron.jsx';
import { File, Download, Checked, Unchecked } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import PaymentStatusLabel from '../PaymentStatusLabel.jsx';

import AuditCycleSummary from './AuditCycleSummary.jsx'
import { fetchClientUsers } from '../../manager/actions/client_user.js';
import {fetchAuditStores, acceptAuditStore, payAuditStore, unpayAuditStore, updateAuditStore} from '../../manager/actions/audit_store.js';
import { assignAuditStoreToClientUser, revokeAuditStoreFromClientUser } from '../../manager/service/audit_store.js';
import { getAuditStoreStatus } from '../../utils.js';
import { getPaymentStatus } from '../../utils.js';

var __AuditStoreRow = React.createClass({
	getInitialState: function(){
		return {};
	},
	assignAuditStore: function(e){
		assignAuditStoreToClientUser(this.props.auditStore.id, this.props.selectedClientUser.user.id).then((auditStore) => this.props.dispatch(updateAuditStore(auditStore)));
	},
	revokeAuditStore: function(e){
		revokeAuditStoreFromClientUser(this.props.auditStore.id, this.props.selectedClientUser.user.id).then((auditStore) => this.props.dispatch(updateAuditStore(auditStore)));
	},
  render: function(){
	  let visibleCheckbox;
	  if( this.props.selectedClientUser){
		  let button;
		  if(this.props.auditStore.status === "COMPLETED" || this.props.auditStore.status === "ACCEPTED"){
			  if(this.props.auditStore.visible_to.indexOf(this.props.selectedClientUser.user.id) > -1){
				  button = <button onClick={this.revokeAuditStore} className="btn btn-primary"><Checked/></button>;
			  } else {
				  button = <button onClick={this.assignAuditStore} className="btn btn-default"><Unchecked/></button>;
			  }
		  }
		  visibleCheckbox = <td>{button}</td>;
	  }
    let auditorUrl = `/auditor/${this.props.auditStore.user.id}`;
    let auditorLink = (<Link to={auditorUrl}>{this.props.auditStore.user.profileinfo.first_name} {this.props.auditStore.user.profileinfo.last_name}</Link>);
    let auditorPhoneLink = (<a href={`tel:${this.props.auditStore.user.profileinfo.mobile_number}`}>{this.props.auditStore.user.profileinfo.mobile_number}</a>);
    let acceptButton = null;
    if(this.props.auditStore.status == 'COMPLETED'){
      if(this.props.auditStore.audit.audit_cycle){
	      acceptButton = (<Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit_store/${this.props.auditStore.id}/accept`} className="btn btn-default">Accept</Link>);
      }
    }
    return(
      <tr>
	    {visibleCheckbox}
        <td><b>{auditorLink}</b> ( {auditorPhoneLink})</td>
        <td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
        <td className="text-right">{acceptButton}</td>
        <td><AuditStoreStatusLabel status={this.props.auditStore.status}/></td>
        <td>
          <Link to={`/audit_store/${this.props.auditStore.id}/report`} className="btn btn-default">View</Link>
        </td>
      </tr>
    );
  },
});
var AuditStoreRow = ReactRedux.connect()(__AuditStoreRow);
var AuditStoreTable = React.createClass({
  render: function(){
    let reps = [];
    for(let n in this.props.auditStores){
	    if( this.props.selectedStatus){
		    if( this.props.auditStores[n].status === this.props.selectedStatus){
			    reps.push(<AuditStoreRow auditStore={this.props.auditStores[n]} key={n} selectedClientUser={this.props.selectedClientUser}/>);
		    }
	    } else {
	    reps.push(<AuditStoreRow auditStore={this.props.auditStores[n]} key={n} selectedClientUser={this.props.selectedClientUser}/>);
	    }
    }
    let checkBoxHeader = null;
    let colCount = 5;
    if( this.props.selectedClientUser){
            checkBoxHeader = <th>{this.props.selectedClientUser.full_name.split(" ")[0]}</th>;
	    colCount++;
    }
    if( reps.length === 0){
	    reps.push(<tr key="empty"><td colSpan={colCount} className="text-center text-muted">no reports here.. check your filters?</td></tr>);
    }
    return(
	<table className="table table-striped">
	  <thead>
	    <tr>
	      {checkBoxHeader}
	      <th>Auditor Name</th>
	      <th>Audit Date</th>
        <th></th>
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
	getInitialState: function(){
		return {
			selectedClientUserId: null,
			selectedStatus: null,
		};
	},
  componentDidMount: function(){
    this.props.dispatch(fetchAuditStores(this.props.params.auditCycleId));
    if(this.props.auditCycle){
	    this.props.dispatch(fetchClientUsers(this.props.auditCycle.client.id));
    }
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps.auditCycle && ! this.props.auditCycle){
	    this.props.dispatch(fetchClientUsers(nextProps.auditCycle.client.id));
    }
  },
	clientUserChanged: function(e){
		this.setState({
			selectedClientUserId: e.target.value
		});
	},
	statusChanged: function(e){
		this.setState({
			selectedStatus: e.target.value
		});
	},
  render: function(){
	  let clientUserRows = [];
	  for( let clientUserId in this.props.clientUsers){
		  clientUserRows.push(<option key={this.props.clientUsers[clientUserId].id} value={this.props.clientUsers[clientUserId].id}>{this.props.clientUsers[clientUserId].full_name}</option>);
	  }
	  let checkBoxHeader = null;
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
    var rows = [];
    for( var i in audits){
	    rows.push(
		    <div className="panel panel-default" key={audits[i].id}>
			<div className="panel-heading">
				<b>{audits[i].store.name}</b>, {audits[i].store.location.name}, {audits[i].store.location.city.name}
			</div>
			<AuditStoreTable auditStores={audits[i].reports} selectedClientUser={this.props.clientUsers[this.state.selectedClientUserId]} selectedStatus={this.state.selectedStatus}/>
		    </div>
	    );
    }
    if( rows.length === 0){
	rows.push(<Jumbotron key="empty" heading="there are no reports here" para="start by assigning a report from Audits section"/>);
    }
    return(
      <div>
        <h3 className="page-header">
          <File/> Reports
          <a className="btn btn-default pull-right" href={url.api_base_path + 'manager/audit_cycle/' + this.props.params.auditCycleId + '/audit_cycle_xlsx_report'}>
              <Download/> Excel Report
          </a>
        </h3>
	    <div className="row">
		    <div className="col-md-4">
			<AuditCycleSummary auditCycleId = {this.props.params.auditCycleId}/>
		    </div>
		    <div className="col-md-8">
	    <div className="form-group">
	  <select className="form-control" style={{display:"inline-block",width:"200px"}} onChange={this.clientUserChanged} value={this.state.selectedClientUserId}>
	    <option value="">Select Client User</option>
	    {clientUserRows}
	   </select>
	    &nbsp;
	  <select className="form-control" style={{display:"inline-block",width:"200px"}} onChange={this.statusChanged} value={this.state.selectedStatus}>
	    <option value="">All Status</option>
	    <option value="ASSIGNED">{getAuditStoreStatus("ASSIGNED")}</option>
	    <option value="SUBMITTED">{getAuditStoreStatus("SUBMITTED")}</option>
	    <option value="WITHDRAWN">{getAuditStoreStatus("WITHDRAWN")}</option>
	    <option value="COMPLETED">{getAuditStoreStatus("COMPLETED")}</option>
	    <option value="FAILED">{getAuditStoreStatus("FAILED")}</option>
	    <option value="ACCEPTED">{getAuditStoreStatus("ACCEPTED")}</option>
	    <option value="REJECTED">{getAuditStoreStatus("REJECTED")}</option>
	   </select>
	    </div>
	    {rows}
		    </div>
	    </div>
        {this.props.children}
      </div>
    );
  },
});

var mapStoreToProps = function(store, ownProps){
  return{
    auditStores: store.auditStores,
    auditCycle: store.auditCycles[ownProps.params.auditCycleId],
    clientUsers: store.clientUsers,
  };
}
export default ReactRedux.connect(mapStoreToProps)(AuditStoreList);

export { AuditStoreTable };
