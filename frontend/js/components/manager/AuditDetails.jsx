import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAudit } from '../../manager_actions.js';

import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import { getAuditType, getAuditStatus } from '../../utils.js';

var AuditLocation = React.createClass({
	render: function(){
		return (
			<li><strong>{this.props.auditLocation.count}</strong> - {this.props.auditLocation.location.name}, {this.props.auditLocation.location.city.name}</li>
		);
	}
});

var AuditDetails = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchAudit(this.props.params.auditId));
	},
	render: function(){
		if(! this.props.audit){
			return <Loading/>;
		}

		var auditLocations = [];
		for( var al of this.props.audit.auditlocations){
			auditLocations.push(<AuditLocation auditLocation={al} key={al.id}/>);
		}

		var linkTo = `/audit/${this.props.audit.id}/edit`;

		return (
			<div>
				<h2 className="page-header">Audit Details</h2>
				<Panel title={this.props.audit.client.name}>
					<Link to={linkTo} className="btn btn-default pull-right">Edit</Link>
					<p>Type: { getAuditType(this.props.audit.type) }</p>
					<p>Status: { getAuditStatus(this.props.audit.status) }</p>
					<p>Start Date: { this.props.audit.start_date }</p>
					<p>End Date: { this.props.audit.end_date }</p>
					<p>Total Audits: { this.props.audit.audit_count }</p>
					<p>Description</p>
					<p>{ this.props.audit.description }</p>
					<p>Locations:</p>
					<ul>
						{auditLocations}
					</ul>
				</Panel>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditDetails);
