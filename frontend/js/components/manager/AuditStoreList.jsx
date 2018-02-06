import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Alert from "react-s-alert";

import moment from 'moment';
import { momentDateFormat, url}  from '../../../config.js';

import Jumbotron from '../Jumbotron.jsx';
import { File, Download, Checked, Unchecked } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import PaymentStatusLabel from '../PaymentStatusLabel.jsx';
import Loading from '../Loading.jsx';

import AuditCycleSummary from './AuditCycleSummary.jsx'
import AuditStoreStatusSummary from './AuditStoreStatusSummary.jsx'
import { fetchClientUsers } from '../../manager/actions/client_user.js';
import {fetchAuditStores, acceptAuditStore, payAuditStore, unpayAuditStore, updateAuditStore} from '../../manager/actions/audit_store.js';
import { findAuditStoresByAuditCycle, assignAuditStoreToClientUser, revokeAuditStoreFromClientUser } from '../../manager/service/audit_store.js';
import { assignToModerator, revokeFromModerator, acceptAllReports } from '../../manager/service/audit_store.js';
import { findModerators } from '../../manager/service/moderator.js'
import { getAuditStoreStatus } from '../../utils.js';
import { getPaymentStatus } from '../../utils.js';

class ModeratorAssignDropdown extends Component{
	constructor(props){
		super(props);
		this.state = {};
	}
	onChange = (e) => {
		if(e.target.value){
			assignToModerator(this.props.auditStoreId, e.target.value).then((auditStore) => {
				this.props.onUpdate(auditStore);
			});
		} else {
			revokeFromModerator(this.props.auditStoreId).then((auditStore) => {
				this.props.onUpdate(auditStore);
			});
		}
	}
	render(){
		let selectedId = this.props.selectedModeratorId[0] || "";
		return (<select className="form-control" onChange={this.onChange} value={selectedId}>
			<option value=""></option>
			{ this.props.moderators.map((m)=> <option key={m.id} value={m.id}>{m.email}</option>) }
		</select>);
	}
}

var __AuditStoreRow = React.createClass({
	getInitialState: function(){
		return {};
	},
	assignAuditStore: function(e){
		assignAuditStoreToClientUser(this.props.auditStore.id, this.props.selectedClientUser.user.id).then((auditStore) => this.props.onUpdate(auditStore));
	},
	revokeAuditStore: function(e){
		revokeAuditStoreFromClientUser(this.props.auditStore.id, this.props.selectedClientUser.user.id).then((auditStore) => this.props.onUpdate(auditStore));
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
	      acceptButton = (<Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit/audit_store/${this.props.auditStore.id}/accept`} className="btn btn-default">Accept</Link>);
      }
    }
    return(
      <tr>
	    {visibleCheckbox}
        <td><b>{auditorLink}</b> ( {auditorPhoneLink})</td>
        <td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
        <td className="text-right">{acceptButton}</td>
        <td><AuditStoreStatusLabel status={this.props.auditStore.status}/></td>
        <td><ModeratorAssignDropdown moderators={this.props.moderators} selectedModeratorId={this.props.auditStore.assigned_to_moderator} auditStoreId={this.props.auditStore.id} onUpdate={this.props.onUpdate}/></td>
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
			    reps.push(<AuditStoreRow auditStore={this.props.auditStores[n]} key={n} selectedClientUser={this.props.selectedClientUser} moderators={this.props.moderators}/>);
		    }
	    } else {
	    reps.push(<AuditStoreRow auditStore={this.props.auditStores[n]} key={n} selectedClientUser={this.props.selectedClientUser} onUpdate={this.props.onUpdate} moderators={this.props.moderators}/>);
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
	    <th>Assigned To</th>
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
			auditStores: [],
			selectedClientUserId: null,
			selectedStatus: null,
			loading: false,
			moderators: [],
		};
	},
	setLoading: function(loading){
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	},
	reloadReports: function(auditCycleId){
		this.setLoading(true);
		findAuditStoresByAuditCycle(auditCycleId).then(auditStores => {
			this.setState({auditStores});
		}).always(()=>this.setLoading(false));
	},
	componentDidMount: function(){
		this.reloadReports(this.props.params.auditCycleId);
		if(this.props.auditCycle){
			this.props.dispatch(fetchClientUsers(this.props.auditCycle.client.id));
		}
		findModerators().then((moderators) => {
			this.setState({ moderators });
		});
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.auditCycle && ! this.props.auditCycle){
			this.props.dispatch(fetchClientUsers(nextProps.auditCycle.client.id));
		}
		if(nextProps.params.auditCycleId !== this.props.params.auditCycleId || (nextProps.location.state && nextProps.location.state.reload)){
			this.reloadReports(nextProps.params.auditCycleId);
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
	auditStoreUpdated: function(auditStore){
		let i = this.state.auditStores.findIndex(as => as.id === auditStore.id);
		if( i !== -1){
			let auditStores = this.state.auditStores;
			auditStores[i] = auditStore;
			this.setState({
				auditStores: auditStores,
			});
		}
	},
	acceptAllClicked: function(){
		if(confirm("Accept all reports with default Audit Fees and Reimbursement?")){
			acceptAllReports(this.props.params.auditCycleId).then((count) => {
				Alert.success(`${count} REPORTS ACCEPTED`);
				this.reloadReports(this.props.params.auditCycleId);
			});
		}
	},
  render: function(){
	  let clientUserRows = [];
	  for( let clientUserId in this.props.clientUsers){
		  clientUserRows.push(<option key={this.props.clientUsers[clientUserId].id} value={this.props.clientUsers[clientUserId].id}>{this.props.clientUsers[clientUserId].full_name}</option>);
	  }
	  let checkBoxHeader = null;
		let audits = [];
		for(let id in this.state.auditStores) {
			let audit = audits.find((a)=> a && a.id === this.state.auditStores[id].audit.id);
			if(! audit){
				audits.push(this.state.auditStores[id].audit);
				audit = audits.find((a)=> a && a.id === this.state.auditStores[id].audit.id);
				audit.reports = [];
			}
			audit.reports.push(this.state.auditStores[id]);
		}
		audits.forEach((audit) => audit.reports.sort((a,b) => {
			if(moment(a.audit_date).isBefore(b.audit_date)){
				return -1;
			} else if(moment(a.audit_date).isAfter(b.audit_date)){
				return 1;
			} else {
				return 0;
			}
		}));
		audits.sort((a,b) => {
			if(a.id < b.id){
				return -1;
			} else if(a.id > b.id){
				return 1;
			} else {
				return 0;
			}
		});
    let rows = [];
    for( let i in audits){
	    rows.push(
		    <div className="panel panel-default" key={audits[i].id}>
			<div className="panel-heading">
				<b>{audits[i].store.name}</b>, {audits[i].store.address}, {audits[i].store.city.name}
			</div>
			<AuditStoreTable auditStores={audits[i].reports} selectedClientUser={this.props.clientUsers[this.state.selectedClientUserId]} selectedStatus={this.state.selectedStatus} onUpdate={this.auditStoreUpdated} moderators={this.state.moderators}/>
		    </div>
	    );
    }
    if( !this.state.loading && rows.length === 0){
	rows.push(<Jumbotron key="empty" heading="there are no reports here" para="start by assigning a report from Audits section"/>);
    }
    if(this.state.loading){
            rows.push(<Loading key="loading"/>);
    }
    return(
      <div>
	    <br/>
	<AuditStoreStatusSummary auditCycleId={this.props.params.auditCycleId}/>
	    <div className="form-group">
	  <select className="form-control" style={{display:"inline-block",width:"200px"}} onChange={this.clientUserChanged} value={this.state.selectedClientUserId}>
	    <option value="">Select Client User</option>
	    {clientUserRows}
	   </select>
	    &nbsp;
	  <select className="form-control" style={{display:"inline-block",width:"200px"}} onChange={this.statusChanged} value={this.state.selectedStatus}>
	    <option value="">All Status</option>
	    <option value="ASSIGNED">{getAuditStoreStatus("ASSIGNED")}</option>
	    <option value="ACKNOWLEDGED">{getAuditStoreStatus("ACKNOWLEDGED")}</option>
	    <option value="SUBMITTED">{getAuditStoreStatus("SUBMITTED")}</option>
	    <option value="WITHDRAWN">{getAuditStoreStatus("WITHDRAWN")}</option>
	    <option value="COMPLETED">{getAuditStoreStatus("COMPLETED")}</option>
	    <option value="FAILED">{getAuditStoreStatus("FAILED")}</option>
	    <option value="ACCEPTED">{getAuditStoreStatus("ACCEPTED")}</option>
	    <option value="REJECTED">{getAuditStoreStatus("REJECTED")}</option>
	   </select>
	    <span className="pull-right">
		<button className="btn btn-default" onClick={this.acceptAllClicked}>
		      Accept All
		  </button>
		&nbsp;
		  <a className="btn btn-default" href={url.api_base_path + 'manager/audit_cycle/' + this.props.params.auditCycleId + '/audit_cycle_xlsx_report'}>
		      <Download/> Excel Report
		  </a>
	    </span>
	    </div>
	    {rows}
        {this.props.children}
      </div>
    );
  },
});

var mapStoreToProps = function(store, ownProps){
  return{
    auditCycle: store.auditCycles[ownProps.params.auditCycleId],
    clientUsers: store.clientUsers,
  };
}
export default ReactRedux.connect(mapStoreToProps)(AuditStoreList);

export { AuditStoreTable };
