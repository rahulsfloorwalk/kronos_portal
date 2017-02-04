import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAuditStore } from '../../auditor/actions/audit_store.js';

import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';
import { LabelValue_2_10 } from '../LabelValue.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';

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
				<div className="row">
				<div className="col-sm-6">
					<div className="panel panel-default">
						<div className="panel-heading">
							<h4 className="panel-title"><b>{this.props.auditStore.audit.audit_cycle.client.name}</b></h4>
						</div>
						<div className="panel-body">
							<div className="form-horizontal">
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
