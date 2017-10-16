import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import Alert from 'react-s-alert';

import { CSSTransitionGroup } from 'react-transition-group';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { pointerStyle }  from '../../styles.js';

import { Duplicate, Cross, HandRight, Pencil, Plus, Inbox, ThumbsUp, ThumbsDown, User, Earphone, Calendar, ChevronDown, ChevronRight } from '../Icons.jsx';
import Badge from '../Badge.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';
import MarkdownViewer from '../MarkdownViewer.jsx';

import ApplicationStatusSummary from './ApplicationStatusSummary.jsx';

import { AuditStoreTable } from './AuditStoreList.jsx';

import {fetchAudits, deleteAudit} from '../../manager/actions/audit.js';

import { rejectAllForAudit, rejectAllForAuditCycle } from '../../manager/service/application.js';

var AuditApplicationList = React.createClass({
	contextTypes: {
		auditCycleId: React.PropTypes.number
	},
	render: function(){
		var rows = [];
		for( let app of this.props.applications){
			let auditorUrl = `/auditor/${app.profileinfo.user_id}`;
			let auditorLink = (<Link to={auditorUrl}>{app.profileinfo.first_name} { app.profileinfo.last_name}</Link>);
			let approveLink, rejectLink, statusLabel;
			if( app.status === "APPLIED"){
				approveLink = (<Link to={`/audit_cycle/${this.context.auditCycleId}/audit/${app.audit}/application/${app.id}/approve`} className="btn btn-primary"><ThumbsUp/> Approve</Link>);
				rejectLink = (<Link to={`/audit_cycle/${this.context.auditCycleId}/audit/${app.audit}/application/${app.id}/reject`} className="btn btn-default"><ThumbsDown/> Deny</Link>);
			} else {
				statusLabel = <ApplicationStatusLabel status={app.status}/>;
			}
			if( app.status !== "NOT_APPLIED"){
				rows.push(
					<div key={app.id} className="col-xs-6 col-md-3">
						<div className="panel panel-default">
						<div className="panel-body">
						<p><User/>&nbsp;{auditorLink}</p>
						<p><Earphone/>&nbsp;<a href={`tel:${app.profileinfo.mobile_number}`}>{app.profileinfo.mobile_number}</a></p>
						<p><Calendar/>&nbsp;{moment(app.audit_date).format(momentDateFormat)}</p>
						<p>
							{approveLink}{rejectLink}
							{statusLabel}
						</p>
						</div>
						</div>
					</div>
				);
			}
		}
		if(rows.length === 0){
			rows = <div className="well well-sm col-md-offset-2 col-md-8 text-center text-muted">no applications for this audit</div>;
		}
		return (
			<div className="row">
				{rows}
			</div>
		);
	}
});

var AuditRow = React.createClass({
  getInitialState: function(){
	  return {
		  expanded: false,
		  dropdown: false,
	  };
  },
	viewButtonClicked: function(e){
		e.preventDefault();
		this.setState({
			expanded: !this.state.expanded
		});
	},
  rejectAllForAuditClicked: function(e){
	  if(confirm("Are you sure you want to deny all applications for this audit?")){
		  rejectAllForAudit(this.props.audit.id).done((count)=>{
			  Alert.success(`${count} APPLICATIONS DENIED`);
			  hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
		  });
	  }
  },
  render: function(){
	  let reportCount = this.props.audit.audit_stores.length;
	  let validReportCount = this.props.audit.audit_stores.filter(report => ["ASSIGNED","SUBMITTED","COMPLETED","ACCEPTED"].includes(report.status)).length;

	  let backgroundColor;
	  if( validReportCount === 0){
		  backgroundColor = "";
	  }
	  else if( validReportCount >= this.props.audit.count){
		  backgroundColor = "#DFF0D8";
	  } else if(validReportCount < this.props.audit.count){
		  backgroundColor = "#FCF8E3";
	  }

	  let trStyle = Object.assign({}, pointerStyle, {
		  backgroundColor
	  });
    return(
      <tbody>
      <tr style={trStyle} onClick={this.viewButtonClicked} title="Click to Expand" className={this.state.expanded ? "active" : ""}>
        <td className="text-right">{this.props.serial}</td>
        <td>
	    {this.props.audit.store.name}<br/>
	    <small className="text-muted">{this.props.audit.store.address}</small>
	</td>
        <td>{this.props.audit.store.location.city.name}</td>
        <td className="text-right">{this.props.audit.earnings_per_audit}</td>
        <td className="text-right">{this.props.audit.reimbursement ? this.props.audit.reimbursement : null}</td>
        <td className="text-right">{this.props.audit.count}</td>
        <td className="text-right">{this.props.audit.applications.filter(app => app.status !== "NOT_APPLIED").length}</td>
        <td className="text-right">{validReportCount} ( {reportCount})</td>
        <td className="text-right">
	    <div className="btn-group">
		    <button type="button" className="btn btn-default" onClick={(e)=>{e.stopPropagation();this.setState({dropdown:!this.state.dropdown});}}>
			    Options <span className="caret"></span>
		    </button>
		    { this.state.dropdown ?
			    <ul className="dropdown-menu" style={{display:"block"}}
			    onMouseEnter={()=>clearTimeout(this.state.dropdownId)}
			    onMouseLeave={()=>this.setState({"dropdownId":setTimeout(()=>this.setState({dropdown:!this.state.dropdown}),500)})}>
				    <li>
					  <Link to={`/audit_cycle/${this.props.auditCycleId}/audit/${this.props.audit.id}/application/fiat`} title="Fiat Assign">
					    <HandRight/> Fiat Assign
					    </Link>
				    </li>
				    <li>
					    <a style={pointerStyle} onClick={this.rejectAllForAuditClicked}>
						    <ThumbsDown/> Deny All Applications
					    </a>
				    </li>
				    <li role="separator" className="divider"></li>
				    <li>
					  <Link to={`/audit_cycle/${this.props.auditCycleId}/audit/${this.props.audit.id}/edit`} title="Edit Audit">
					    <Pencil/> Edit
					    </Link>
				    </li>
				    <li>
					  <a onClick={this.props.onDelete ? (e) => { e.stopPropagation(); this.props.onDelete(this.props.audit)} : ()=>{} } title="Delete Audit">
					    <Cross/> Delete
					  </a>
				    </li>
			    </ul>
		    : null}
	    {/*<button type="button" className="btn btn-default" onClick={this.viewButtonClicked} title="Expand Applications">
			    View
		    </button>
			    {/*this.state.expanded ? <ChevronDown/> : <ChevronRight/>*/}
	    </div>
        </td>
      </tr>
	<CSSTransitionGroup
		component="tr"
		transitionName="fade"
		transitionEnterTimeout={300}
		transitionLeaveTimeout={300}>
		{ this.state.expanded ?
			<td colSpan="9" style={{paddingLeft:"70px"}}>
				<MarkdownViewer markdown={this.props.audit.post_approval_description}/>
			</td>
		: null }
	</CSSTransitionGroup>
	<CSSTransitionGroup
		component="tr"
		transitionName="fade"
		transitionEnterTimeout={300}
		transitionLeaveTimeout={300}>
		{ this.state.expanded ?
			<td colSpan="9" style={{paddingLeft:"70px"}}>
				<AuditApplicationList applications={this.props.audit.applications}/>
			</td>
		: null }
	</CSSTransitionGroup>
	<CSSTransitionGroup
		component="tr"
		transitionName="fade"
		transitionEnterTimeout={300}
		transitionLeaveTimeout={300}>
		{ this.state.expanded ?
			<td colSpan="9" style={{paddingLeft:"70px"}}>
				<AuditStoreTable auditStores={this.props.audit.audit_stores}/>
			</td>
		: null }
	</CSSTransitionGroup>
      </tbody>
    );
  },
});

var AuditList = React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			selectedCityId: null,
		};
	},
	setLoading: function(loading){
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	},
  componentDidMount: function(){
	  this.setLoading(true);
    this.props.dispatch(fetchAudits(this.props.params.auditCycleId)).always(()=>this.setLoading(false));
  },
  onDelete: function(audit){
	  this.props.dispatch(deleteAudit(audit.id)).then(()=>{
		  Alert.success("AUDIT DELETED");
	  }, ()=> {
		  Alert.warning("AUDIT CANNOT BE DELETED");
	  });
  },
  onCityChanged: function(e){
	  this.setState({selectedCityId: e.target.value});
  },
  cityComparator: function(a,b){
	if(a.name < b.name) return -1;
	if(a.name > b.name) return 1;
	return 0;
  },
  rejectAllForAuditCycleClicked: function(e){
	  if(confirm("Are you sure you want to deny all applications for this audit cycle?")){
		  rejectAllForAuditCycle(this.props.params.auditCycleId).done((count)=>{
			  Alert.success(`${count} APPLICATIONS DENIED`);
			  hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
		  });
	  }
  },
  render: function(){
	  if(this.state.loading){
		  return <Loading/>;
	  }

	let cities = Object.keys(this.props.audits).reduce( (p, id) => {
		if(! p.find( c => c.id === this.props.audits[id].store.location.city.id)){
			return p.concat(this.props.audits[id].store.location.city);
		} else {
			return p;
		}
	}, []).sort(this.cityComparator);

    let serial = 1;
    let rows = Object.values(this.props.audits)
		  .sort((a,b) => this.cityComparator(a.store.location.city, b.store.location.city))
		  .filter((a) => this.state.selectedCityId ? a.store.location.city.id === parseInt(this.state.selectedCityId) : true)
		  .map( a => <AuditRow key={a.id}
				  serial={serial++}
				  auditCycleId={this.props.params.auditCycleId}
				  audit={a}
				  onDelete={this.onDelete}
				  />
		  );
    var addAuditLink = `/audit_cycle/${this.props.params.auditCycleId}/audit/add`;
    return(
      <div>
        <h3 className="page-header">
	  <span className="pull-right">
	    <div className="btn-group">
		    <Link to={addAuditLink} className="btn btn-default"> <Plus/> Add Audit </Link>
		    <button type="button" className="btn btn-default" onClick={(e)=>{e.stopPropagation();this.setState({dropdown:!this.state.dropdown});}}>
			    <span className="caret"></span>
		    </button>
		    { this.state.dropdown ?
			    <ul className="dropdown-menu" style={{display:"block"}}
			    onMouseEnter={()=>clearTimeout(this.state.dropdownId)}
			    onMouseLeave={()=>this.setState({"dropdownId":setTimeout(()=>this.setState({dropdown:!this.state.dropdown}),500)})}>
				    <li>
					    <Link to={`/audit_cycle/${this.props.params.auditCycleId}/audit/copy`} title="Copy Audits">
					      <Duplicate/> Copy Audits
					    </Link>
				    </li>
				    <li>
					    <a style={pointerStyle} onClick={this.rejectAllForAuditCycleClicked}>
						    <ThumbsDown/> Deny All Applications
					    </a>
				    </li>
			    </ul>
		    : null}
	    </div>
	    &nbsp;
          </span>
          <Inbox/> Audits
        </h3>
	<ApplicationStatusSummary auditCycleId={this.props.params.auditCycleId}/>
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="text-right">#</th>
              <th>Store</th>
              <th>
		<select value={this.state.selectedCity} onChange={this.onCityChanged} className="form-control">
			<option value="">City</option>
		    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
	        </select>
	      </th>
              <th className="text-right">Fees (₹)</th>
              <th className="text-right">Reimbursement upto (₹)</th>
              <th className="text-right">Audit Count</th>
              <th className="text-right">Applications</th>
              <th className="text-right">Reports</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
            {rows}
        </table>
        {this.props.children}
      </div>
    );
  },
});

var mapAuditToProps = function(store, ownProps){
  return{
    audits: store.audits,
  };
}
export default ReactRedux.connect(mapAuditToProps)(AuditList);
