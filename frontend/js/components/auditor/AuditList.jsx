import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAudits, fetchProfileInfo } from '../../auditor_actions.js'
import { getAuditType, getAuditStatus } from '../../utils.js';
import { LabelValue_2_10 } from '../LabelValue.jsx';

var AuditRow = React.createClass({
	render: function(){
		var linkTo = `/audit/${this.props.audit.id}`;
		var cities = "";
		for(var c of this.props.audit.cities){
			cities += c.name + ", ";
		}
		return (
			<div className="col-sm-6 col-md-4">
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">{this.props.audit.client.name}</h4>
					</div>
					<div className="panel-body">
						<div className="form-horizontal">
							<LabelValue_2_10 label="Type:" value={getAuditType(this.props.audit.type)}/>
							<LabelValue_2_10 label="Status:" value={getAuditStatus(this.props.audit.status)}/>
							<LabelValue_2_10 label="Earning:" value={"₹ " + this.props.audit.earnings_per_audit + " per audit"}/>
							<LabelValue_2_10 label="Cities:" value={cities}/>
							<LabelValue_2_10 label="Dates:" value={this.props.audit.start_date + " to " + this.props.audit.end_date}/>
							<LabelValue_2_10 label="No:" value={this.props.audit.audit_count}/>
						</div>
						<p>
							<Link to={linkTo} className="btn btn-default pull-right">View</Link>
						</p>
					</div>
				</div>
			</div>
		);
	},
});

var AuditList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAudits());
		this.props.dispatch(fetchProfileInfo());
	},
	render: function(){
		if( this.props.profileInfo && ! this.props.profileInfo.is_complete){
			return (
				<div className="jumbotron text-center">
					<h2>Please complete your personal information</h2>
					<p>We're sorry, but we need to know more about you to assign audits to you.</p>
				</div>
			);
		}
		var rows = [];
		for(var id in this.props.audits) {
			rows.push(<AuditRow audit={this.props.audits[id]} key={id}/>);
		}
		if(rows.length > 0){
		return (
			<div>
				<h2 className="page-header">
					Available Audits
				</h2>
				<div className="row">
					{rows}
				</div>
				{this.props.children}
			</div>
		);
		} else {
			return (
				<div className="jumbotron text-center">
					<h2>There are no audits available right now.</h2>
					<h3>Thanks for checking in :)</h3>
					<p>We will keep you informed when new audits are available.</p>
				</div>
			);
		}
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		audits: store.audits
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditList); 
