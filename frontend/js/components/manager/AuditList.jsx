import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { Check, Cross, User, Earphone, Calendar, ChevronDown, ChevronRight, MenuRight, MenuDown } from '../Icons.jsx';
import Badge from '../Badge.jsx';
import Panel from '../Panel.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';

import {fetchAudits} from '../../manager/actions/audit.js';

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
				approveLink = (<Link to={`/audit_cycle/${this.context.auditCycleId}/audit/${app.audit}/application/${app.id}/approve`} className="btn btn-primary"><Check/> Approve</Link>);
				rejectLink = (<Link to={`/audit_cycle/${this.context.auditCycleId}/audit/${app.audit}/application/${app.id}/reject`} className="btn btn-default"><Cross/> Reject</Link>);
			} else {
				statusLabel = <ApplicationStatusLabel status={app.status}/>;
			}
			if( app.status !== "NOT_APPLIED"){
				rows.push(
					<div key={app.id} className="col-md-3">
						<div className="panel panel-default">
						<div className="panel-body">
						<p><User/>{auditorLink}</p>
						<p><Earphone/>{app.profileinfo.mobile_number}</p>
						<p><Calendar/>{app.audit_date}</p>
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
			rows = <div className="well well-sm col-md-8 col-md-offset-2 text-center text-muted">no applications for this audit</div>;
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
		  expanded: false
	  };
  },
	viewButtonClicked: function(e){
		e.preventDefault();
		this.setState({
			expanded: !this.state.expanded
		});
	},
  render: function(){
	  var row2;
	  if(this.state.expanded){
		  row2 = (
			<tr>
				<td colSpan="4">
					<AuditApplicationList applications={this.props.audit.applications}/>
				</td>
			</tr>
		  );
	  }
	  var buttonText = this.state.expanded ? <ChevronDown/> : <ChevronRight/>;
    return(
      <tbody>
      <tr>
        <td>{this.props.audit.store.name}</td>
        <td>{this.props.audit.count}</td>
        <td>{this.props.audit.applications.length}</td>
        <td>
          <button className="btn btn-default pull-right" onClick={this.viewButtonClicked}>{buttonText}</button>
        </td>
      </tr>
	{row2}
      </tbody>
    );
  },
});

var AuditList = React.createClass({
  componentDidMount: function(){
    this.props.dispatch(fetchAudits(this.props.params.auditCycleId));
  },
  render: function(){
    var rows = [];
    for(var id in this.props.audits){
      rows.push(<AuditRow audit={this.props.audits[id]} key={id} />);
    }
    var addAuditLink = `/audit_cycle/${this.props.params.auditCycleId}/audit/add`;
    return(
      <div>
        <h2 className="page-header">
          <Link to={addAuditLink} className="btn btn-default pull-right">Add Audit</Link>
          Audit List
        </h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Store</th>
              <th>Application Count</th>
              <th>Applications Received</th>
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
