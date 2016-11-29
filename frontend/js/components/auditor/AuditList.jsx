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
			return (<h2>Please complete your personal info to view available audits.</h2>);
		}
		var rows = [];
		for(var id in this.props.audits) {
			rows.push(<AuditRow audit={this.props.audits[id]} key={id}/>);
		}
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
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		audits: store.audits
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditList); 
