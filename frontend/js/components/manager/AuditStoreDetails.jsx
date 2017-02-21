import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditStore, completeAuditStore, failAuditStore, withdrawAuditStore, unSubmitAuditStore } from '../../manager/actions/audit_store.js';

import ExpandableDetails from '../ExpandableDetails.jsx';
import { Retweet, King, File } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import { LabelValue_2_10 } from '../LabelValue.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

import AttachmentDisplayBox from './AttachmentDisplayBox.jsx';

var AuditStoreDetails = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
	},
	withdrawButtonClicked: function(e){
		this.props.dispatch(withdrawAuditStore(this.props.params.auditStoreId));
	},
	completeButtonClicked: function(e){
		this.props.dispatch(completeAuditStore(this.props.params.auditStoreId));
	},
	failButtonClicked: function(e){
		this.props.dispatch(failAuditStore(this.props.params.auditStoreId));
	},
	unSubmitButtonClicked: function(e){
		this.props.dispatch(unSubmitAuditStore(this.props.params.auditStoreId));
	},
	render: function(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let withdrawButton, failButton, completeButton, unSubmitButton;
		if(this.props.auditStore.status === 'ASSIGNED' || this.props.auditStore.status === 'SUBMITTED'){
			withdrawButton = (<button onClick={this.withdrawButtonClicked} type="button" className="btn btn-default">Withdraw</button>);
		}
		if(this.props.auditStore.status === 'SUBMITTED'){
			unSubmitButton = (<button onClick={this.unSubmitButtonClicked} type="button" className="btn btn-warning">Un Submit</button>);
			completeButton = (<button onClick={this.completeButtonClicked} type="button" className="btn btn-success">Complete</button>);
			failButton = (<button onClick={this.failButtonClicked} type="button" className="btn btn-danger">Fail</button>);
		}
		let detailsElement = <ExpandableDetails details={this.props.auditStore.audit.audit_cycle.description}/>;

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.auditStore.audit.audit_cycle.client.id}`}><King/> {this.props.auditStore.audit.audit_cycle.client.name}</Link></li>
					<li><Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit_store`}><Retweet/> {this.props.auditStore.audit.audit_cycle.name}</Link></li>
					<li className="active"><File/> {this.props.auditStore.audit.store.name}</li>
				</ol>
				<h2 className="page-header">
					<File/> Audit Report
				</h2>
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">Audit Details</h4>
					</div>
					<table className="table table-striped">
						<tbody>
							<tr>
								<td className="text-right">Client:</td>
								<th>{this.props.auditStore.audit.audit_cycle.client.name}</th>
							</tr>
							<tr>
								<td className="text-right">Store:</td>
								<th>{this.props.auditStore.audit.store.name}</th>
							</tr>
							<tr>

								<td className="text-right">Location:</td>
								<th>{`${this.props.auditStore.audit.store.location.name}, ${this.props.auditStore.audit.store.location.city.name}`}</th>
							</tr>
							<tr>
								<td className="text-right">Type:</td>
								<th>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</th>
							</tr>
							<tr>
								<td className="text-right">Fees:</td>
								<th>₹ {this.props.auditStore.audit.earnings_per_audit}</th>
							</tr>
							<tr>
								<td className="text-right">Reimbursement upto:</td>
								<th>₹ {this.props.auditStore.audit.reimbursement}</th>
							</tr>
							<tr>
								<td className="text-right">Auditor:</td>
								<th>{`${this.props.auditStore.user.profileinfo.first_name} ${this.props.auditStore.user.profileinfo.last_name}`}</th>
							</tr>
							<tr>
								<td className="text-right">Audit Date:</td>
								<th>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</th>
							</tr>
							<tr>
								<td className="text-right">Status:</td>
								<th><AuditStoreStatusLabel status={this.props.auditStore.status}/></th>
							</tr>
						</tbody>
					</table>
					<div className="panel-body">
						<b>Details</b>: {detailsElement}
					</div>
					<div className="panel-footer text-right">
						{withdrawButton}&nbsp;{unSubmitButton}&nbsp;{completeButton}&nbsp;{failButton}
					</div>
				</div>
				<AttachmentDisplayBox auditStoreId={this.props.params.auditStoreId}/>
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
