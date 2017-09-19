import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { CSSTransitionGroup } from 'react-transition-group';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { pointerStyle }  from '../../styles.js';

import { Cross, HandRight, Pencil, Plus, Inbox, ThumbsUp, ThumbsDown, User, Earphone, Calendar, ChevronDown, ChevronRight } from '../Icons.jsx';
import Badge from '../Badge.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';
import MarkdownViewer from '../MarkdownViewer.jsx';

import { AuditStoreTable } from './AuditStoreList.jsx';

import {fetchAudits, deleteAudit} from '../../manager/actions/audit.js';

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
  render: function(){
	  let trStyle = Object.assign({}, pointerStyle, {
	  });
    return(
      <tbody>
      <tr style={pointerStyle} onClick={this.viewButtonClicked} title="Click to Expand" className={this.state.expanded ? "active" : ""}>
        <td className="text-right">{this.props.serial}</td>
        <td>{this.props.audit.store.name}</td>
        <td>{this.props.audit.store.location.name}, {this.props.audit.store.location.city.name}</td>
        <td>{this.props.audit.earnings_per_audit}</td>
        <td>{this.props.audit.reimbursement}</td>
        <td>{this.props.audit.count}</td>
        <td>{this.props.audit.applications.filter(app => app.status !== "NOT_APPLIED").length}</td>
        <td>{this.props.audit.audit_stores.length}</td>
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
				    <li role="separator" className="divider"></li>
				    <li>
					  <Link to={`/audit_cycle/${this.props.auditCycleId}/audit/${this.props.audit.id}/edit`} title="Edit Audit">
					    <Pencil/> Edit
					    </Link>
				    </li>
				    <li>
					  <a onClick={this.props.onDelete ? () => this.props.onDelete(this.props.audit) : ()=>{} } title="Delete Audit">
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
		transitionEnterTimeout={500}
		transitionLeaveTimeout={300}>
		{ this.state.expanded ?
			<td colSpan="9">
				<MarkdownViewer markdown={this.props.audit.post_approval_description}/>
			</td>
		: null }
	</CSSTransitionGroup>
	<CSSTransitionGroup
		component="tr"
		transitionName="fade"
		transitionEnterTimeout={500}
		transitionLeaveTimeout={300}>
		{ this.state.expanded ?
			<td colSpan="9">
				<AuditApplicationList applications={this.props.audit.applications}/>
			</td>
		: null }
	</CSSTransitionGroup>
	<CSSTransitionGroup
		component="tr"
		transitionName="fade"
		transitionEnterTimeout={500}
		transitionLeaveTimeout={300}>
		{ this.state.expanded ?
			<td colSpan="9">
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
	  this.props.dispatch(deleteAudit(audit.id));
  },
  render: function(){
	  if(this.state.loading){
		  return <Loading/>;
	  }
    var rows = [];
    let serial = 1;
    for(var id in this.props.audits){
      rows.push(<AuditRow serial={serial++} auditCycleId={this.props.params.auditCycleId} audit={this.props.audits[id]} key={id} onDelete={this.onDelete}/>);
    }
    var addAuditLink = `/audit_cycle/${this.props.params.auditCycleId}/audit/add`;
    return(
      <div>
        <h3 className="page-header">
          <Link to={addAuditLink} className="btn btn-default pull-right"><Plus/> Add Audit</Link>
          <Inbox/> Audits
        </h3>
        <table className="table table-hover table-bordered">
	    <colgroup>
		<col/>
		<col style={{width:"20%"}}/>
	    </colgroup>
          <thead>
            <tr>
              <th className="text-right">#</th>
              <th>Store</th>
              <th>Location</th>
              <th>Fees</th>
              <th>Reimbursement upto</th>
              <th>Audit Count</th>
              <th>Applications</th>
              <th>Reports</th>
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
