import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditStore, submitAuditStore } from '../../auditor/actions/audit_store.js';

import ExpandableDetails from '../ExpandableDetails.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';
import { LabelValue_2_10 } from '../LabelValue.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';

import AttachmentUploadBox from './AttachmentUploadBox.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AuditStoreDetails = React.createClass({
	getInitialState: function(){
		return {
			submitMessage : ""
		};
	},
	componentDidMount: function(){
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
	},
	submitButtonClicked: function(e){
		var promise = this.props.dispatch(submitAuditStore(this.props.params.auditStoreId));
		promise.then(() => {
			this.setState({
				submitMessage : "submitted successfully"
			});
		},(err) => {
			console.debug("ERRRRR:", err);
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0]
			});
		});
	},
	render: function(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let submitAuditButton;
		if(this.props.auditStore.status === 'ASSIGNED'){
			submitAuditButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary">Submit Report</button>);
		}

		let fees = this.props.auditStore.audit.earnings_per_audit ? <b>Fees: ₹ {this.props.auditStore.audit.earnings_per_audit}, </b> : "";
		let reimb = this.props.auditStore.audit.reimbursement ? <span>Reimbursement upto: <b>₹ {this.props.auditStore.audit.reimbursement}</b></span> : "";
		let detailsElement = <ExpandableDetails details={this.props.auditStore.audit.audit_cycle.description}/>;

		return (
			<div>
				<div className="row">
				<div className="col-md-6">
					<div className="panel panel-default">
						<div className="panel-heading">
							<h4 className="panel-title"><b>{this.props.auditStore.audit.audit_cycle.client.name}</b></h4>
						</div>
						<div className="panel-body">
							<div className="form-horizontal">
								<LabelValue_2_10 label="Type:" value={getAuditType(this.props.auditStore.audit.audit_cycle.type)}/>
								<LabelValue_2_10 label="Store:" value={this.props.auditStore.audit.store.name}/>
								<LabelValue_2_10 label="Address:" value={this.props.auditStore.audit.store.address}/>
								<LabelValue_2_10 label="Fees:" value={<span>{fees}{reimb}</span>}/>
								<LabelValue_2_10 label="Audit Date:" value={moment(this.props.auditStore.audit_date).format(momentDateFormat)}/>
								<LabelValue_2_10 label="Details:" value={detailsElement}/>
								<LabelValue_2_10 label="Status:" value={<AuditStoreStatusLabel status={this.props.auditStore.status}/>}/>
							</div>
						</div>
						<div className="panel-footer text-right">
							{this.state.submitMessage}&nbsp;&nbsp;{submitAuditButton}
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<AttachmentUploadBox auditStoreId={this.props.params.auditStoreId}/>
				</div>
				</div>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
		sections: store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreDetails);
/*
				<div className="row">
					<div className="col-md-4">
						<Panel title={this.props.audit.audit_cycle.client.name} noBody={true}>
							<table className="table table-border table-striped">
								<tbody>
									<tr>
										<td className="text-right">Type:</td>
										<th>{ getAuditType(this.props.audit.audit_cycle.type) }</th>
									</tr>
									<tr>
										<td className="text-right">Audit Fees: </td>
										<th>₹ { this.props.audit.audit_cycle.earnings_per_audit } per audit</th>
									</tr>
									<tr>
										<td className="text-right">Start Date:</td>
										<th>{ this.props.audit.audit_cycle.start_date }</th>
									</tr>
									<tr>
										<td className="text-right">End Date:</td> 
										<th>{ this.props.audit.audit_cycle.end_date }</th>
									</tr>
									<tr>
										<td colSpan="2">
											<p><strong>Description:</strong></p>
											<p>{ this.props.audit.audit_cycle.description }</p>
										</td>
									</tr>
								</tbody>
							</table>
						</Panel>
					</div>
				</div>
*/
