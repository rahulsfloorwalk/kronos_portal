import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditStores } from '../../auditor/actions/audit_store.js';
import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';

import ExpandableDetails from '../ExpandableDetails.jsx';
import { Cross, ShareAlt } from '../Icons.jsx';
import { getAuditType, getAuditStatus } from '../../utils.js';
import { LabelValue_2_10 } from '../LabelValue.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import Jumbotron from '../Jumbotron.jsx';

var AuditStoreRow = React.createClass({
	render: function(){
		let fees = this.props.auditStore.audit.earnings_per_audit ? <b>Fees: ₹ {this.props.auditStore.audit.earnings_per_audit}, </b> : "";
		let reimb = this.props.auditStore.audit.reimbursement ? <span>Reimbursement upto: <b>₹ {this.props.auditStore.audit.reimbursement}</b></span> : "";
		let detailsElement = <ExpandableDetails details={this.props.auditStore.audit.audit_cycle.description}/>;
		return (
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title"><b>{this.props.auditStore.audit.audit_cycle.client.name}</b></h4>
					</div>
					<div className="panel-body">
						<div className="form-horizontal">
							<LabelValue_2_10 label="Type:" value={getAuditType(this.props.auditStore.audit.audit_cycle.type)}/>
							<LabelValue_2_10 label="Location:" value={`${this.props.auditStore.audit.store.location.name}, ${this.props.auditStore.audit.store.location.city.name}`}/>
							<LabelValue_2_10 label="Fees:" value={<span>{fees}{reimb}</span>}/>
							<LabelValue_2_10 label="Audit Date:" value={moment(this.props.auditStore.audit_date).format(momentDateFormat)}/>
							<LabelValue_2_10 label="Details:" value={detailsElement}/>
							<LabelValue_2_10 label="Status:" value={<AuditStoreStatusLabel status={this.props.auditStore.status}/>}/>
						</div>
						<p className="text-right"><Link to={`/audit_store/${this.props.auditStore.id}/section`} className="btn btn-default">View</Link></p>
					</div>
				</div>
		);
	},
});

var AuditStoreList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAuditStores());
		this.props.dispatch(fetchProfileInfo());
	},
	render: function(){
		var rows = [];
		for(var id in this.props.auditStores) {
			rows.push(<AuditStoreRow auditStore={this.props.auditStores[id]} key={id}/>);
		}
		if(rows.length > 0){
			return (
				<div>
					<h2 className="page-header">
						Your Audits
					</h2>
						{rows}
					{this.props.children}
				</div>
			);
		} else {
			return (
				<div className="jumbotron text-center">
					<h2>There are no audits approved for you.</h2>
					<h3>Apply for some audits from the audits section!</h3>
					<p>We will keep you informed when audits are approved for you</p>
				</div>
			);
		}
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		auditStores: store.auditStores,
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreList); 
