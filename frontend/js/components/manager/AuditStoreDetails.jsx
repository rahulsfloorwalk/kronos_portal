import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAuditStore } from '../../manager/actions/audit_store.js';

import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import { LabelValue_2_10 } from '../LabelValue.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AuditStoreDetails = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
	},
	render: function(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.auditStore.audit.audit_cycle.client.id}`}>{this.props.auditStore.audit.audit_cycle.client.name}</Link></li>
					<li><Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}`}>Cycle: <b>{this.props.auditStore.audit.audit_cycle.start_date}</b> to <b>{ this.props.auditStore.audit.audit_cycle.end_date}</b></Link></li>
					<li className="active">Report: <b>{this.props.auditStore.audit.store.name}</b></li>
				</ol>
				<h2 className="page-header">
					Audit Report
				</h2>
				<div className="row">
				<div className="col-md-6">
					<div className="panel panel-default">
						<div className="panel-heading">
							<h4 className="panel-title"><b>{this.props.auditStore.audit.audit_cycle.client.name}</b></h4>
						</div>
						<div className="panel-body">
								<LabelValue_2_10 label="Auditor:" value={`${this.props.auditStore.user.profileinfo.first_name} ${this.props.auditStore.user.profileinfo.last_name}`}/>
								<LabelValue_2_10 label="Type:" value={getAuditType(this.props.auditStore.audit.audit_cycle.type)}/>
								<LabelValue_2_10 label="Location:" value={`${this.props.auditStore.audit.store.location.name}, ${this.props.auditStore.audit.store.location.city.name}`}/>
								<LabelValue_2_10 label="Fees:" value={"₹ " + this.props.auditStore.audit.audit_cycle.earnings_per_audit + " per audit"}/>
								<LabelValue_2_10 label="Audit Date:" value={this.props.auditStore.audit_date}/>
								<LabelValue_2_10 label="Details:" value={this.props.auditStore.audit.audit_cycle.description}/>
								<LabelValue_2_10 label="Status:" value={<AuditStoreStatusLabel status={this.props.auditStore.status}/>}/>
						</div>
					</div>
				</div>
				</div>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreDetails);
