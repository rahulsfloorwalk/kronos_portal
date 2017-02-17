import React from 'react';
import { Link } from 'react-router';

import { fetchAuditStore } from '../service/audit_store.js';

import { File } from '../../js/components/Icons.jsx';
import Panel from '../../js/components/Panel.jsx';
import Loading from '../../js/components/Loading.jsx';
import AuditStoreStatusLabel from '../../js/components/AuditStoreStatusLabel.jsx';
import { LabelValue_2_10 } from '../../js/components/LabelValue.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../js/utils.js';

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function(){
		fetchAuditStore(this.props.params.auditStoreId).then((auditStore) => {
			this.setState({
				auditStore
			});
		});
	},
	render: function(){
		if(! this.state.auditStore){
			return <Loading/>;
		}

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/store">Stores</Link></li>
					<li><Link to={`/store/${this.state.auditStore.audit.store.id}/audit_store`}>{this.state.auditStore.audit.store.name}</Link></li>
					<li className="active">Audit: <b>{this.state.auditStore.audit_date}</b></li>
				</ol>
				<h2 className="page-header">
					<File/> Audit Report
				</h2>
				<div className="row">
				<div className="col-md-6">
					<div className="panel panel-default">
						<div className="panel-heading">
							<h4 className="panel-title"><b>{this.state.auditStore.audit.audit_cycle.client.name}</b></h4>
						</div>
						<table className="table table-striped">
							<tbody>
								<tr>
									<td className="text-right">Type:</td>
									<th>{getAuditType(this.state.auditStore.audit.audit_cycle.type)}</th>
								</tr>
								<tr>
									<td className="text-right">Location:</td>
									<th>{`${this.state.auditStore.audit.store.location.name}, ${this.state.auditStore.audit.store.location.city.name}`}</th>
								</tr>
								<tr>
									<td className="text-right">Audit Date:</td>
									<th>{this.state.auditStore.audit_date}</th>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				</div>
				{this.props.children}
			</div>
		);
	},
});
